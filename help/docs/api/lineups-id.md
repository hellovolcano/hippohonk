---
sidebar_position: 11
---

# `/lineups/{id}`

## GET

**Summary:** List bands in a lineup by festival id


Uses `{id}` as the festival_id.


### Responses

### Response 200

OK

### Response fields
_Array of items_


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `id` | integer | yes | no |  |
| `festival_id` | integer | yes | no |  |
| `band_id` | integer | yes | no |  |
| `name` | string | no | yes |  |
| `description` | string | no | yes |  |
| `location` | string | no | yes |  |
| `average_rating` | number | no | yes |  |
| `image` | string | no | yes |  |
| `festival_name` | string | no | yes |  |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |

