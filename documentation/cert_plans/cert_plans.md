# Automating SSL Certificates for all User Servers

In order to guarantee secure connections to user servers from the phoster.com website, we need to make sure that each server has an SSL certificate. To do this, I plan on using a wildcard certificate and a hash DNS space that resolves into the ip.

## The 3 Major Components

### 1. the DNS space

It is unfeasible to automatically generate new SSL certificates for every possible IP address when a user sets up a new server. In order to solve this issue, a dynamic DNS space can be used instead to route traffic to the specific server IP. To do this, we can use a DNS space for the schema `ip.server_id_hash.phoster.direct` which will resolve to the IP.

For example, `123.456.78.90.<hash>.phoster.direct` would map to `123.456.78.90`.

### 2. the wildcard certificate

Wildcard certificates will be used to ensure that any `ip.hash.phoster.direct` address will be supported through SSL. To do this, when a server is first started, it will request a wildcard certificate for its own hash, in the form `*.<hash>.phoster.direct`. Then, even if the IP of the server changes, the client wildcard cert will still cover it.

### 3. the server registrar

Finally, we will need a centralized registrar that will hold current records of the user server IPs against their IDs. This will be in a schema similar to:

```json
{
    "server_id": "uhm2QlAFsEYW8DXgAsCHnuloPJb2",
    "server_ip": "123.456.78.90"
}
```

Upon startup (or when the IP changes), every server will send a patch request to the registrar to update it's current IP address. This ensures that the registrar will always have the most up-to-date locational information.

Then, when a user needs to connect to a server, they can lookup the IP from the registrar and go directly to `123.456.78.90.46a91806ca41d245ff372b59de11f1590afbe44e6a6f1b07ee0d635a1719c584.phoster.direct`.

### Here's a diagram of the server initialization flow

![Init Flow](<init flow.png>)

## Client Flow

When a client needs to connect to a user server, they must undergo a few steps before initializing the TLS handshake.

1. First, a client will retrieve the IP from the server registrar by the server ID.
2. Then, the client will hash the ID and send a connection request to `<IP><sha256(ID)>.phoster.direct`
3. The DDNS layer will route the request to `<IP>`.
4. The client will initialize the TLS handshake through the `*.<sha256(ID)>.phoster.direct` wildcard cert

![Client Flow](<client flow.png>)

![Flow Diagram](<flow diagram.png>)
