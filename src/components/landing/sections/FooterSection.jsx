import React from "react";

const links = {
  Product: ["Features", "How It Works", "Use Cases", "Integrations", "Pricing"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

function FooterSection() {
  return React.createElement(
    "footer",
    { className: "border-t border-border/50 py-16" },
    React.createElement(
      "div",
      { className: "max-w-6xl mx-auto px-4" },
      React.createElement(
        "div",
        { className: "grid grid-cols-2 md:grid-cols-4 gap-8 mb-12" },
        React.createElement(
          "div",
          { className: "col-span-2 md:col-span-1" },
          React.createElement("span", { className: "text-xl font-bold gradient-text" }, "Sutrak"),
          React.createElement(
            "p",
            { className: "text-sm text-muted-foreground mt-3 max-w-xs" },
            "AI-powered event guest automation and logistics platform."
          )
        ),
        Object.entries(links).map(([cat, items]) =>
          React.createElement(
            "div",
            { key: cat },
            React.createElement(
              "h4",
              { className: "text-sm font-semibold text-foreground mb-4" },
              cat
            ),
            React.createElement(
              "ul",
              { className: "space-y-2" },
              items.map((item) =>
                React.createElement(
                  "li",
                  { key: item },
                  React.createElement(
                    "a",
                    {
                      href: "#",
                      className:
                        "text-sm text-muted-foreground hover:text-foreground transition-colors",
                    },
                    item
                  )
                )
              )
            )
          )
        )
      ),
      React.createElement(
        "div",
        {
          className:
            "border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4",
        },
        React.createElement(
          "p",
          { className: "text-sm text-muted-foreground" },
          "© 2026 Sutrak. All rights reserved."
        ),
        React.createElement(
          "div",
          { className: "flex items-center gap-6" },
          ["Twitter", "LinkedIn", "GitHub"].map((s) =>
            React.createElement(
              "a",
              {
                key: s,
                href: "#",
                className:
                  "text-sm text-muted-foreground hover:text-foreground transition-colors",
              },
              s
            )
          )
        )
      )
    )
  );
}

export default FooterSection;