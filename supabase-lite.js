(function () {
  function createClient(baseUrl, anonKey) {
    const url = String(baseUrl || "").replace(/\/+$/, "");
    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    };

    return {
      from(table) {
        return new Query(url, headers, table);
      },
      storage: {
        from(bucket) {
          return {
            async upload(path, file, options = {}) {
              try {
                const response = await fetch(`${url}/storage/v1/object/${bucket}/${encodePath(path)}`, {
                  method: "POST",
                  headers: {
                    ...headers,
                    "Content-Type": file.type || "application/octet-stream",
                    "x-upsert": String(Boolean(options.upsert))
                  },
                  body: file
                });
                if (!response.ok) return { data: null, error: await toError(response) };
                return { data: { path }, error: null };
              } catch (error) {
                return { data: null, error };
              }
            },
            getPublicUrl(path) {
              return {
                data: {
                  publicUrl: `${url}/storage/v1/object/public/${bucket}/${encodePath(path)}`
                }
              };
            }
          };
        }
      },
      channel() {
        return {
          on() {
            return this;
          },
          subscribe() {
            return this;
          }
        };
      }
    };
  }

  class Query {
    constructor(baseUrl, headers, table) {
      this.baseUrl = baseUrl;
      this.headers = headers;
      this.table = table;
      this.params = new URLSearchParams();
      this.filters = [];
      this.orderValues = [];
      this.method = "GET";
      this.body = null;
      this.returnSingle = false;
      this.wantRepresentation = false;
      this.countMode = "";
    }

    select(columns = "*", options = {}) {
      this.params.set("select", columns);
      if (options.count) this.countMode = options.count;
      return this;
    }

    eq(column, value) {
      this.filters.push(`${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`);
      return this;
    }

    neq(column, value) {
      this.filters.push(`${encodeURIComponent(column)}=neq.${encodeURIComponent(value)}`);
      return this;
    }

    in(column, values = []) {
      const list = values.map(value => String(value).replace(/,/g, "\\,")).join(",");
      this.filters.push(`${encodeURIComponent(column)}=in.(${encodeURIComponent(list)})`);
      return this;
    }

    order(column, options = {}) {
      this.orderValues.push(`${column}.${options.ascending === false ? "desc" : "asc"}`);
      this.params.set("order", this.orderValues.join(","));
      return this;
    }

    limit(value) {
      this.params.set("limit", String(value));
      return this;
    }

    insert(value) {
      this.method = "POST";
      this.body = value;
      this.wantRepresentation = false;
      return this;
    }

    update(value) {
      this.method = "PATCH";
      this.body = value;
      this.wantRepresentation = false;
      return this;
    }

    upsert(value) {
      this.method = "POST";
      this.body = value;
      this.wantRepresentation = false;
      this.upserting = true;
      return this;
    }

    delete() {
      this.method = "DELETE";
      return this;
    }

    single() {
      this.returnSingle = true;
      this.wantRepresentation = true;
      return this;
    }

    then(resolve, reject) {
      return this.execute().then(resolve, reject);
    }

    async execute() {
      try {
        const query = this.params.toString();
        const filters = this.filters.join("&");
        const separator = query && filters ? "&" : "";
        const endpoint = `${this.baseUrl}/rest/v1/${this.table}${query || filters ? "?" : ""}${query}${separator}${filters}`;
        const requestHeaders = {
          ...this.headers,
          "Content-Type": "application/json"
        };

        const prefer = [];
        if (this.upserting) prefer.push("resolution=merge-duplicates");
        if (this.countMode) prefer.push(`count=${this.countMode}`);
        if (this.wantRepresentation || this.method === "POST" || this.method === "PATCH") prefer.push("return=representation");
        if (prefer.length) requestHeaders.Prefer = prefer.join(",");

        const response = await fetch(endpoint, {
          method: this.method,
          headers: requestHeaders,
          body: this.body == null ? undefined : JSON.stringify(this.body)
        });

        if (!response.ok) return { data: null, error: await toError(response), count: null };

        const text = await response.text();
        const parsed = text ? JSON.parse(text) : null;
        const data = this.returnSingle ? (Array.isArray(parsed) ? parsed[0] : parsed) : parsed;
        const count = this.countMode && Array.isArray(parsed) ? parsed.length : null;
        return { data, error: null, count };
      } catch (error) {
        return { data: null, error, count: null };
      }
    }
  }

  async function toError(response) {
    try {
      const payload = await response.json();
      return new Error(payload.message || payload.msg || JSON.stringify(payload));
    } catch {
      return new Error(`HTTP ${response.status}`);
    }
  }

  function encodePath(value) {
    return String(value).split("/").map(encodeURIComponent).join("/");
  }

  window.supabase = { createClient };
})();
