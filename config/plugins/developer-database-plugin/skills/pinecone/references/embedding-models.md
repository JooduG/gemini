# Pinecone Embedding Models & Integrated Inference

Pinecone provides an integrated embeddings endpoint (`https://api.pinecone.io/embed`) that transforms text strings into high-dimensional dense vector embeddings directly within the Pinecone infrastructure.

---

## 1. Integrated Embeddings Architecture

Instead of orchestrating external embedding providers (such as OpenAI or Cohere) through separate network boundaries, Pinecone generates embeddings hosted in the same region as your serverless indexes.

### The Canonical API Request

```http
POST https://api.pinecone.io/embed
Api-Key: <PINECONE_API_KEY>
X-Pinecone-API-Version: 2024-07
Content-Type: application/json

{
  "model": "multilingual-e5-large",
  "parameters": {
    "input_type": "passage",
    "truncate": "END"
  },
  "inputs": [
    { "text": "Architectural specification chunk 1..." },
    { "text": "Architectural specification chunk 2..." }
  ]
}
```

---

## 2. Ingestion vs Query `input_type`

Embedding models like `multilingual-e5-large` use asymmetric query/passage encoders for superior retrieval:

| Task | `parameters.input_type` | Description |
| :--- | :--- | :--- |
| **Ingestion (Upserting)** | `"passage"` | Optimizes the dense vector representation for long-form factual content, documentation, and code. |
| **Search (Querying)** | `"query"` | Encodes the user or agent's short search question to align with relevant document passages. |

---

## 3. Supported Hosted Models

1. **`multilingual-e5-large`** (Default for Developer Database):
   - **Dimensions**: 1024
   - **Max Tokens**: 512
   - **Language Support**: 100+ languages
   - **Distance Metric**: `cosine`
2. **`llama-text-embed-v2`**:
   - **Dimensions**: 4096 (or truncated to 1024/768)
   - **Optimized for**: Deep semantic reasoning and complex technical prose.
3. **`pinecone-sparse-english-v0`**:
   - **Type**: Sparse (lexical BM25 token frequencies)
   - **Optimized for**: Hybrid search keyword matching.

---

## 4. Chunk Sizing & Batch Limits

- **Text Record Batch Limit**: Maximum **96** text items per `/embed` batch. Our engine uses a safe batch size of **50**.
- **Vector Payload Limit**: Ensure each batch stays below 2 MB total HTTP body payload.
- **Truncation**: Always set `"truncate": "END"` to prevent API errors when documentation or code chunks exceed the model token context limit.
