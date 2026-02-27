import OpenAI from "openai"

const openai = new OpenAI();

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: "you are a useful ai assistant, that tells time and weather",
    },
];

const getTime = () => {
    const time = new Date();
    const hh = String(time.getHours()).padStart(2, "0");
    const mm = String(time.getMinutes()).padStart(2, "0");
    const ss = String(time.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
}


process.stdin.addListener('data', async (input) => {
    const trimmedInput = input.toString().trim();
    context.push({ role: "user", content: trimmedInput });
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: context,
        tools: [
            {
                type: "function",
                function: {
                    name: "getTime",
                    description: "Get the current time"
                }
            }
        ],
        tool_choice: "auto"
    })
    context.push({ role: "assistant", content: response.choices[0].message.content });
    console.log("Assistant: ", response.choices[0].message.content);
})