---
sidebar_position: 10
---

# `/lineups`

## GET

**Summary:** List lineups


Note: In the current controller code, `include` is assigned twice, so the first include is overwritten.
If you want Band and Festival included, change include to an array: `include: [ { model: Band, ... }, { model: Festival, ... } ]`.



### Responses

### Response 200

OK

### Response fields
_Array of items_


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `id` | integer | no | no |  |
| `band_id` | integer | no | no |  |
| `festival_id` | integer | no | no |  |
| `band` | object | no | yes |  |
| `festival` | object | no | yes |  |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |


## POST

**Summary:** Add a band to a lineup (festival hardcoded to 16)


Currently hardcoded to festival_id=16 in the controller.


### Request body fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `band_id` | integer | yes | no |  |


### Responses

### Response 201

Created

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `id` | integer | yes | no | Primary key. |
| `band_id` | integer | yes | yes | FK to bands.id |
| `festival_id` | integer | yes | yes | FK to festivals.id |
| `created_at` | string (date-time) | yes | no | Timestamp when created. |
| `updated_at` | string (date-time) | yes | no | Timestamp when last updated. |


### Response 500

Server error

### Response fields


| Field | Type | Required | Nullable | Description |
|------|------|----------|----------|-------------|
| `message` | string | yes | no |  |

