# Running Without a Real Backend (mock backend)

Sometimes the backend might be broken, but you still want to develop the
UI. Sometimes you want full control over responses UI is getting.
For this purpose we’ve created a basic mock server that sends mock
data. It doesn’t support all actions the real backend supports, but it
should allow you to run the UI and test basic read-only functionality.

`npm start` runs `mockdata/mockserver.py` in the background and arranges webpack proxying
such that UI will access if given `?env=mockdata` (synonim `?env=mockserver`) URL param.

## Preparing Data for Mock Backend

To capture data from a real cluster, run:

```
mockdata/record-real-cluster.sh $CLUSTER_SERVICE_ID
```

(as more APIs get added, the script may need additions...)

The mock backend serves the data stored in the files under the `mockdata/api` directory. There's an one-to-one mapping between API requests and the files. For example, for the request `GET /api/clusters_mgmt/v1/clusters`, the mock backend serves the file `api/clusters/mgmt/v1/clusters.json`.

The file contains JSON data which can be as simple as a single API response.

```json
{
  "kind": "ClusterList",
  "page": 1,
  "size": 14,
  "total": 14,
  "items": [
    ......
  ]
}
```

For multiple API responses, use an array. A `match` field in the special `_meta_` object is used to match a request to its response. Responses are matched in the order as they are set in the array. It is a match when the `_meta_` is missing or it does not contain the `match` field.

For example, this file contains two API responses. The backend returns the 1st one when the request method is POST. Otherwise, it returns the 2nd as the default.

```json
[
  {
    "_meta_": {
      "match": {
        "method": "POST",
      }
    },
    "kind": "Cluster",
    "id": "abcxyz",
    ......
  },
  {
    "kind": "ClusterList",
    "page": 1,
    "size": 14,
    "total": 14,
    "items": [
      ......
    ]
  }
]
```

The `match` field can have,

- `method` to match the HTTP method;

- `request_body` to match the request payload.

Multiple rules are combined using `AND`. For example, in order to match a `POST` request with the payload `{"action": "create", "resource_type": "Cluster"}`, use

```json
"_meta_": {
  "match": {
    "method": "POST",
    "request_body": {
      "action": "create",
      "resource_type": "Cluster"
    }
  }
},
```

An `inject` field can be added to `_meta_` to change the request behaviour,

- `delay` to add a delay for the request;

- `ams_error` to replace the response by an AMS error.

For example, using this `inject`, it takes 1s for the request to return an AMS error with error code 11.

```json
"_meta_": {
  "inject": {
    "delay": "1s",
    "ams_error": "11"
  }
},

------ response (duration 1s) ------
{
  "id": "11",
  "kind": "Error",
  "href": "/api/accounts_mgmt/v1/errors/11",
  "code": "ACCT-MGMT-11",
  "reason": "Error calling OCM Account Manager",
  "operation_id": "021187a5-5650-41ed-9027-27d6e9ed9075"
}
```
