# Local CMS review guide

1. Run `npm run setup`; retrieve the editor token privately from `.env.local`. Open `/en/admin` or `/de/admin`; token stays in memory only. Sign out before switching roles. Use demo review text, not unsourced performance claims.
2. Editor selects an existing stable variant, creates an editorial label and a review note. The preview appears as a draft; verified names, codes and compatibility cannot be changed through editorial copy.
3. Technical approver uses their separate token, reviews a specific revision, supplies the evidence URL, document version, issue/review dates and confirms rights and applicable scope. Impossible dates and backwards review ordering are rejected. This demo review verifies the workflow; it does not turn demo variants into sellable products.
4. Administrator publishes the approved demo note. Refresh the product page: the note appears while the demo/fulfilment block remains. Attempting to publish an unapproved revision or review with the editor token returns an authorization/approval error.
5. Audit trail identifies every draft, review, publication and integration result. Historical revisions remain stored. There is no silent overwrite of source identifiers.
6. For production, import owner-approved ProductFamily/Decor/Finish/Variant compatibility, application joins, versioned technical/care documents and ClaimEvidence. Require current review dates and scope, not website prose, for product claims. Replace local tokens with individual least-privilege staff identity. Draft preview must not be indexed. Add publication scheduling, rollback and asset signing before launch.

The queue is a local demonstration: retry produces visible unconfigured-adapter failures; simulated acceptance produces `demo-complete`. Neither path emails people, creates real leads or asks a warehouse to dispatch. Never connect these adapters without owner authorization and an explicit demo-variant guard.
