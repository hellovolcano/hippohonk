---
sidebar_position: 5
---

# `/bands/{id}`

## GET

**Summary:** Get band by id


### Responses

### Response 200

OK (null if not found)

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `id` | integer | yes | no |  |
| `name` | string | yes | no |  |
| `description` | string | no | yes |  |
| `average_rating` | number | no | yes |  |
| `location` | string | no | yes |  |
| `url` | string | no | yes |  |
| `genre_id` | integer | no | yes |  |
| `genre_name` | string | no | yes |  |
| `image` | string | no | yes |  |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |

