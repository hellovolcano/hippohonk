---
sidebar_position: 8
---

# `/festivals/{slug}`

## GET

**Summary:** Get festival by slug


### Responses

### Response 200

OK (null if not found)

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `id` | integer | no | no |  |
| `name` | string | no | yes | Name of the festival |
| `slug` | string | no | yes |  |
| `date` | string | no | yes | Festival date (format depends on model; often ISO 8601). |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |

