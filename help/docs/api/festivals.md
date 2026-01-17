---
sidebar_position: 7
---

# `/festivals`

## GET

**Summary:** List festivals (sorted by date desc)


### Responses

### Response 200

OK

### Response fields
_Array of items_


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

