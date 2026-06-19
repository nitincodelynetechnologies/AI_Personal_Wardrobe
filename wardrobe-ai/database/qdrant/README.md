# Qdrant Collections

Vector collection initialization for the AI Personal Wardrobe Platform.

## Phase 1: `users_face_vectors`

| Property   | Value                                      |
|------------|--------------------------------------------|
| Dimensions | 512                                        |
| Distance   | Cosine                                     |
| Purpose    | Face embeddings for biometric auth         |

## Phase 2 Collections

### `fashion_dna_vectors`

| Property   | Value                                      |
|------------|--------------------------------------------|
| Dimensions | 512 (configurable)                         |
| Distance   | Cosine                                     |
| Purpose    | Fashion DNA similarity embeddings          |

Payload: `user_id`, `fashion_dna_id`, `fashion_style`, `style_score`

### `recommendation_vectors`

| Property   | Value                                      |
|------------|--------------------------------------------|
| Dimensions | 512 (configurable)                         |
| Distance   | Cosine                                     |
| Purpose    | Outfit and item recommendation embeddings  |

Payload: `user_id`, `item_id`, `category`, `source`

## Initialize

**All collections (Phase 1 + Phase 2):**

```powershell
.\scripts\init-qdrant.ps1
```

**Phase 2 only:**

```powershell
.\database\qdrant\init_phase2_collections.ps1
```

**macOS / Linux:**

```bash
chmod +x database/qdrant/init_phase2_collections.sh
./database/qdrant/init_phase2_collections.sh
```

Collection definitions: `collections/*.json`
