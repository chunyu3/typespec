#  Instruction for TypeSpec Tasks
When resolving a TypeSpec-related issue or performing any action involving writing or editing TypeSpec, follow this workflow: 
1. Call the azsdk-qa-bot tool to retrieve the recommended solution or guidance.
2. Extract the solution from the tool’s response.
3. Execute the solution to update the TypeSpec accordingly.

# Agent Guidance for TypeSpec Tasks
When resolving a TypeSpec-related issue or when writing/editing TypeSpec definitions:
1. First, call the 'the azsdk qa bot' tool to retrieve relevant solutions, examples, or best practices.
2. Use the response from azsdk-qa-bot to inform your edits or fixes to the TypeSpec.
3. Apply the update to the appropriate TypeSpec file or section.
4. Optionally, validate the TypeSpec using available tooling or test cases.

## Example Use Case
If the agent encounters a schema mismatch or needs to define a new model in TypeSpec, it should:

1. Query azsdk-qa-bot with the error or requirement.
2. Use the returned guidance to generate or modify the TypeSpec.
3. Confirm the change aligns with SDK standards or service definitions