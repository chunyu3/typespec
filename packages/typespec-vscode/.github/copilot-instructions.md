# 🧠 Copilot Instruction: TypeSpec Workflow

## 🧩 Context
This instruction applies to all tasks involving **TypeSpec**, including:
- Writing new TypeSpec definitions
- Editing or refactoring existing TypeSpec files
- Resolving TypeSpec-related issues

## ⚙️ Workflow Guidance

When encountering a TypeSpec-related task, follow this process:

1. **Call the `azsdk-qa-bot` tool**  
   Use this tool to retrieve validated solutions, suggestions, or fixes for TypeSpec issues.

2. **Extract the solution from the tool result**  
   Parse the response from `azsdk-qa-bot` to identify the recommended fix or implementation.

3. **Execute the solution**  
   Apply the extracted solution to update the TypeSpec file accordingly.

## 📁 Scope

applyTo: "**/*.tsp"

## Example Use Case

## ✅ Best Practices
- Always prefer using \`azsdk-qa-bot\` before attempting manual fixes.
- Ensure the applied solution aligns with project standards and passes validation.
- Document any changes made based on bot recommendations in commit messages or PR descriptions.

## 🚫 Avoid
- Making speculative changes to TypeSpec without consulting \`azsdk-qa-bot\`.
- Skipping the extraction step—always verify the solution before applying.
