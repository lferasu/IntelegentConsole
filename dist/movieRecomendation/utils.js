"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cosineSimilarity = exports.findClosestMovies = exports.createEmbeddingAndSave = void 0;
const openai_1 = __importDefault(require("openai"));
const fs_1 = require("fs");
const path_1 = require("path");
const openai = new openai_1.default();
function loadJSONData(fileName) {
    const path = (0, path_1.join)(__dirname, fileName);
    const rawData = (0, fs_1.readFileSync)(path);
    return JSON.parse(rawData.toString());
}
const movies = loadJSONData("movies.json");
const inputs = movies.map((m) => `Title: ${m.title}. Year: ${m.year}. Genre: ${m.genre}. Director: ${m.director}. Rating: ${m.rating}. Summary: ${m.short_description}`);
const createEmbeddingAndSave = async () => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: inputs
    });
    const movieVectors = [];
    response.data.forEach((embedding, index) => {
        movieVectors.push({
            title: movies[index].title,
            embedding: embedding.embedding
        });
    });
    (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, "movieVectors.json"), JSON.stringify(movieVectors, null, 2));
};
exports.createEmbeddingAndSave = createEmbeddingAndSave;
const findClosestMovies = (queryEmbedding, movieVectors, topK = 5) => {
    const similarities = movieVectors.map(movie => ({
        title: movie.title,
        similarity: (0, exports.cosineSimilarity)(queryEmbedding, movie.embedding)
    }));
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
};
exports.findClosestMovies = findClosestMovies;
const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};
exports.cosineSimilarity = cosineSimilarity;
