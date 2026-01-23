use indexmap::IndexMap;
use serde_json::Value;
use std::collections::HashSet;
use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::Pass;
use swc_core::ecma::ast::*;
use swc_core::ecma::transforms::testing::test_inline;
use swc_core::ecma::visit::{VisitMut, VisitMutWith};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

struct AtomicVariantsCollector {
    collected_classes: HashSet<String>,
    tag: String,
}

impl VisitMut for AtomicVariantsCollector {
    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        if let Callee::Expr(expr) = &call.callee {
            if let Expr::Ident(ident) = &**expr {
                if ident.sym == *"atomic" {
                    if let Some(ExprOrSpread { expr: arg, .. }) = call.args.first() {
                        if let Expr::Object(obj) = &**arg {
                            let mut responsive_variants: Option<Vec<String>> = None;
                            let mut responsive_sizes = vec![
                                "sm".to_string(),
                                "md".to_string(),
                                "lg".to_string(),
                                "xl".to_string(),
                                "2xl".to_string(),
                            ];
                            let mut variant_map: IndexMap<String, Vec<String>> = IndexMap::new();

                            for prop in &obj.props {
                                if let PropOrSpread::Prop(p) = prop {
                                    if let Prop::KeyValue(kv) = &**p {
                                        if let PropName::Ident(key) = &kv.key {
                                            match key.sym.as_ref() {
                                                "variants" => {
                                                    if let Expr::Object(variants_obj) = &*kv.value {
                                                        for variant_prop in &variants_obj.props {
                                                            if let PropOrSpread::Prop(vp) =
                                                                variant_prop
                                                            {
                                                                if let Prop::KeyValue(vkv) = &**vp {
                                                                    if let PropName::Ident(
                                                                        variant_key,
                                                                    ) = &vkv.key
                                                                    {
                                                                        if let Expr::Object(
                                                                            variant_obj,
                                                                        ) = &*vkv.value
                                                                        {
                                                                            let mut values = vec![];
                                                                            for pair in
                                                                                &variant_obj.props
                                                                            {
                                                                                if let PropOrSpread::Prop(p2) = pair {
                                                                                    if let Prop::KeyValue(kv2) = &**p2 {
                                                                                        if let Expr::Lit(Lit::Str(s)) = &*kv2.value {
                                                                                            values.push(s.value.to_string());
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            variant_map.insert(
                                                                                variant_key
                                                                                    .sym
                                                                                    .to_string(),
                                                                                values,
                                                                            );
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                "responsiveVariants" => match &*kv.value {
                                                    Expr::Array(arr) => {
                                                        let mut props = vec![];
                                                        for elem in &arr.elems {
                                                            if let Some(ExprOrSpread {
                                                                expr, ..
                                                            }) = elem
                                                            {
                                                                if let Expr::Lit(Lit::Str(s)) =
                                                                    &**expr
                                                                {
                                                                    props.push(s.value.to_string());
                                                                }
                                                            }
                                                        }
                                                        responsive_variants = Some(props);
                                                    }
                                                    Expr::Lit(Lit::Bool(b)) if b.value => {
                                                        responsive_variants = Some(
                                                            variant_map.keys().cloned().collect(),
                                                        );
                                                    }
                                                    _ => {}
                                                },
                                                "responsiveSizes" => {
                                                    if let Expr::Array(arr) = &*kv.value {
                                                        let mut sizes = vec![];
                                                        for elem in &arr.elems {
                                                            if let Some(ExprOrSpread {
                                                                expr, ..
                                                            }) = elem
                                                            {
                                                                if let Expr::Lit(Lit::Str(s)) =
                                                                    &**expr
                                                                {
                                                                    sizes.push(s.value.to_string());
                                                                }
                                                            }
                                                        }
                                                        responsive_sizes = sizes;
                                                    }
                                                }
                                                _ => {}
                                            }
                                        }
                                    }
                                }
                            }

                            if let Some(props) = responsive_variants {
                                for p in props {
                                    if let Some(vals) = variant_map.get(&p) {
                                        for prefix in &responsive_sizes {
                                            for class in vals {
                                                self.collected_classes
                                                    .insert(format!("{}:{}", prefix, class));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

impl AtomicVariantsCollector {
    fn apply_to_module(&mut self, module: &mut Module) {
        module.visit_mut_with(self);

        if !self.collected_classes.is_empty() {
            let mut sorted_classes: Vec<_> = self.collected_classes.iter().cloned().collect();
            sorted_classes.sort();
            let classes = sorted_classes.join(" ");

            let comment_stmt = ModuleItem::Stmt(Stmt::Expr(ExprStmt {
                span: DUMMY_SP,
                expr: Box::new(Expr::Lit(Lit::Str(Str {
                    span: DUMMY_SP,
                    value: format!("/* {}:{} */", self.tag, classes).into(),
                    raw: None,
                }))),
            }));

            let insert_index = module
                .body
                .iter()
                .position(|item| !matches!(item, ModuleItem::ModuleDecl(ModuleDecl::Import(_))))
                .unwrap_or(0);

            module.body.insert(insert_index, comment_stmt);
        }
    }
}

impl Pass for AtomicVariantsCollector {
    fn process(&mut self, program: &mut Program) {
        if let Program::Module(ref mut module) = program {
            self.apply_to_module(module);
        }
    }
}

#[plugin_transform]
pub fn process(mut program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let mut tag = "__atomic_generated".to_string();
    if let Some(config_json) = metadata.get_transform_plugin_config() {
        if let Ok(config) = serde_json::from_str::<Value>(&config_json) {
            if let Some(custom_tag) = config.get("tag").and_then(|v| v.as_str()) {
                tag = custom_tag.to_string();
            }
        }
    }

    if let Program::Module(ref mut module) = program {
        let mut collector = AtomicVariantsCollector {
            collected_classes: HashSet::new(),
            tag,
        };
        collector.apply_to_module(module);
    }

    program
}

test_inline!(
    Default::default(),
    |_| AtomicVariantsCollector {
        collected_classes: HashSet::new(),
        tag: "__atomic_generated".to_string()
    },
    default,
    r#"import { atomic } from "atomic-variants";

const button = atomic({
  base: "font-semibold",
  variants: {
    color: {
      primary: "bg-blue-500",
    },
    padding: {
      primary: "p-1"
    }
  },
  responsiveVariants: ["color"],
});"#,
    r#"import { atomic } from "atomic-variants";
"/* __atomic_generated:2xl:bg-blue-500 lg:bg-blue-500 md:bg-blue-500 sm:bg-blue-500 xl:bg-blue-500 */"
const button = atomic({
  base: "font-semibold",
  variants: {
    color: {
      primary: "bg-blue-500",
    },
    padding: {
      primary: "p-1"
    }
  },
  responsiveVariants: ["color"],
});"#
);

test_inline!(
    Default::default(),
    |_| AtomicVariantsCollector {
        collected_classes: HashSet::new(),
        tag: "__atomic_generated".to_string()
    },
    all_variants_true,
    r#"import { atomic } from "atomic-variants";

const box = atomic({
  variants: {
    color: {
      primary: "bg-green-500",
      secondary: "bg-red-500"
    },
    size: {
      sm: "p-2",
      lg: "p-8"
    }
  },
  responsiveVariants: true
});"#,
    r#"import { atomic } from "atomic-variants";
"/* __atomic_generated:2xl:bg-green-500 2xl:bg-red-500 2xl:p-2 2xl:p-8 lg:bg-green-500 lg:bg-red-500 lg:p-2 lg:p-8 md:bg-green-500 md:bg-red-500 md:p-2 md:p-8 sm:bg-green-500 sm:bg-red-500 sm:p-2 sm:p-8 xl:bg-green-500 xl:bg-red-500 xl:p-2 xl:p-8 */"
const box = atomic({
  variants: {
    color: {
      primary: "bg-green-500",
      secondary: "bg-red-500"
    },
    size: {
      sm: "p-2",
      lg: "p-8"
    }
  },
  responsiveVariants: true
});"#
);

test_inline!(
    Default::default(),
    |_| AtomicVariantsCollector {
        collected_classes: HashSet::new(),
        tag: "__atomic_generated".to_string()
    },
    custom_responsive_sizes,
    r#"import { atomic } from "atomic-variants";

const btn = atomic({
  variants: {
    color: {
      blue: "bg-blue-600",
    },
  },
  responsiveVariants: ["color"],
  responsiveSizes: ["sm", "md"]
});"#,
    r#"import { atomic } from "atomic-variants";
"/* __atomic_generated:md:bg-blue-600 sm:bg-blue-600 */"
const btn = atomic({
  variants: {
    color: {
      blue: "bg-blue-600",
    },
  },
  responsiveVariants: ["color"],
  responsiveSizes: ["sm", "md"]
});"#
);

test_inline!(
    Default::default(),
    |_| AtomicVariantsCollector {
        collected_classes: HashSet::new(),
        tag: "__atomic_generated".to_string()
    },
    multiple_variants,
    r#"import { atomic } from "atomic-variants";

const input = atomic({
  variants: {
    color: {
      red: "bg-red-600",
      green: "bg-green-600"
    },
    border: {
      thin: "border",
      thick: "border-4"
    }
  },
  responsiveVariants: ["color", "border"]
});"#,
    r#"import { atomic } from "atomic-variants";
"/* __atomic_generated:2xl:bg-green-600 2xl:bg-red-600 2xl:border 2xl:border-4 lg:bg-green-600 lg:bg-red-600 lg:border lg:border-4 md:bg-green-600 md:bg-red-600 md:border md:border-4 sm:bg-green-600 sm:bg-red-600 sm:border sm:border-4 xl:bg-green-600 xl:bg-red-600 xl:border xl:border-4 */"
const input = atomic({
  variants: {
    color: {
      red: "bg-red-600",
      green: "bg-green-600"
    },
    border: {
      thin: "border",
      thick: "border-4"
    }
  },
  responsiveVariants: ["color", "border"]
});"#
);

test_inline!(
    Default::default(),
    |_| AtomicVariantsCollector {
        collected_classes: HashSet::new(),
        tag: "__atomic_generated".to_string()
    },
    no_responsive_variants,
    r#"import { atomic } from "atomic-variants";

const card = atomic({
  base: "shadow",
  variants: {
    color: {
      dark: "bg-gray-900",
      light: "bg-gray-100"
    }
  }
});"#,
    r#"import { atomic } from "atomic-variants";
const card = atomic({
  base: "shadow",
  variants: {
    color: {
      dark: "bg-gray-900",
      light: "bg-gray-100"
    }
  }
});"#
);

test_inline!(
    Default::default(),
    |_| AtomicVariantsCollector {
        collected_classes: HashSet::new(),
        tag: "__atomic_generated".to_string()
    },
    merged_nested_calls,
    r#"import { atomic } from "atomic-variants";

const one = atomic({
  variants: { tone: { warm: "bg-orange-300" } },
  responsiveVariants: ["tone"]
});

const two = atomic({
  variants: { tone: { cool: "bg-blue-300" } },
  responsiveVariants: ["tone"]
});"#,
    r#"import { atomic } from "atomic-variants";
"/* __atomic_generated:2xl:bg-blue-300 2xl:bg-orange-300 lg:bg-blue-300 lg:bg-orange-300 md:bg-blue-300 md:bg-orange-300 sm:bg-blue-300 sm:bg-orange-300 xl:bg-blue-300 xl:bg-orange-300 */"
const one = atomic({
  variants: { tone: { warm: "bg-orange-300" } },
  responsiveVariants: ["tone"]
});

const two = atomic({
  variants: { tone: { cool: "bg-blue-300" } },
  responsiveVariants: ["tone"]
});"#
);
