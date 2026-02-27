"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default();
const createEmbedding = async (input) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input
    });
    console.log(response.data[0].embedding);
};
createEmbedding("Hello world! into vectorization");
