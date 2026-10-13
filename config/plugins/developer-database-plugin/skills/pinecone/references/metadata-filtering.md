# Metadata Filtering in Pinecone

Pinecone supports MongoDB-style operators for filtering vector search results. Metadata filtering narrows the candidate search space so only matching records are returned and ranked.

---

## 1. Supported Operators

| Operator  | Type                        | Description              | Example                                                                  |
| :-------- | :-------------------------- | :----------------------- | :----------------------------------------------------------------------- |
| `$eq`     | String, Number, Boolean     | Equal to                 | `{"genre": {"$eq": "documentary"}}`                                      |
| `$ne`     | String, Number, Boolean     | Not equal to             | `{"status": {"$ne": "archived"}}`                                        |
| `$gt`     | Number                      | Greater than             | `{"year": {"$gt": 2024}}`                                                |
| `$gte`    | Number                      | Greater than or equal to | `{"score": {"$gte": 0.85}}`                                              |
| `$lt`     | Number                      | Less than                | `{"index": {"$lt": 10}}`                                                 |
| `$lte`    | Number                      | Less than or equal to    | `{"tier": {"$lte": 2}}`                                                  |
| `$in`     | Array of Strings or Numbers | In list                  | `{"category": {"$in": ["rules", "skills"]}}`                             |
| `$nin`    | Array of Strings or Numbers | Not in list              | `{"source": {"$nin": ["tmp", "scratch"]}}`                               |
| `$exists` | Boolean                     | Field presence check     | `{"indexed_at": {"$exists": true}}`                                      |
| `$and`    | Array of filter objects     | Logical AND              | `{"$and": [{"year": {"$gte": 2024}}, {"project": {"$eq": "rpglitch"}}]}` |
| `$or`     | Array of filter objects     | Logical OR               | `{"$or": [{"tag": {"$eq": "ai"}}, {"tag": {"$eq": "game"}}]}`            |

---

## 2. Mandatory Rules & Invariants

1. **Flat Metadata Only**:
   - Pinecone does **NOT** support nested object structures in vector metadata.
   - **Correct**: `metadata: { "project": "rpglitch", "chunk_index": 2 }`
   - **Incorrect**: `metadata: { "project": { "name": "rpglitch", "tier": 2 } }` (Causes 400 rejection).

2. **Array Handling (`$in` and string lists)**:
   - When filtering on a metadata field containing an array of strings (e.g. `tags: ["ai", "core"]`), `$in` checks whether any array element matches:

     ```json
     { "tags": { "$in": ["core"] } }
     ```

3. **Managed vs Serverless Index Schema Invariant**:
   - On managed / serverless indexes, filterable metadata fields **MUST NOT be declared in the schema builder**. They auto-index on upsert. Including non-search fields in `SchemaBuilder` returns a 400 error.
