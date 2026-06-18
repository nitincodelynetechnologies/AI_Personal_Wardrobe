# Qdrant Collections

Vector collection initialization for the AI Personal Wardrobe Platform.

## Phase 1: `users_face_vectors`

| Property   | Value                                      |
|------------|--------------------------------------------|
| Dimensions | 512                                        |
| Distance   | Cosine                                     |
| Purpose    | Face embeddings for biometric auth         |

### Payload Schema

| Field        | Type    | Description                    |
|--------------|---------|--------------------------------|
| `user_id`    | keyword | PostgreSQL `wardrobe.users.id` |
| `name`       | keyword | Display name                   |
| `email`      | keyword | User email                     |
| `avatar_url` | keyword | Avatar object URL              |

## Initialize

**Windows:**

```powershell
.\database\qdrant\init_users_face_vectors.ps1
```

**macOS / Linux:**

```bash
chmod +x database/qdrant/init_users_face_vectors.sh
./database/qdrant/init_users_face_vectors.sh
```

Collection definition reference: `collections/users_face_vectors.json`
