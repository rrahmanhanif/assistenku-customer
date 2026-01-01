 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/api/orders/[orderId]/evidence/decision.js b/api/orders/[orderId]/evidence/decision.js
new file mode 100644
index 0000000000000000000000000000000000000000..6cadfdf6eb3fd63f8d256d21926b1f837f06d9e2
--- /dev/null
+++ b/api/orders/[orderId]/evidence/decision.js
@@ -0,0 +1,42 @@
+import { supabaseAdmin } from "../../../_supabaseClient.js";
+import { appendTimeline } from "../../../_orderHelpers.js";
+import { parseBody, pathParam, requireCustomer, sendJson } from "../../../_utils.js";
+
+export default async function handler(req, res) {
+  if (req.method !== "POST") return sendJson(res, 405, { success: false, message: "Method not allowed" });
+
+  const customerId = requireCustomer(req);
+  if (!customerId) return sendJson(res, 401, { success: false, message: "Unauthorized" });
+
+  const orderId = req.query?.orderId || pathParam(req, "orderId");
+  if (!orderId) return sendJson(res, 400, { success: false, message: "Missing order id" });
+
+  const { decision, note } = await parseBody(req);
+  if (!decision) return sendJson(res, 400, { success: false, message: "decision is required" });
+
+  const { data: existing } = await supabaseAdmin
+    .from("orders")
+    .select("status, customer_id, requires_evidence_approval")
+    .eq("id", orderId)
+    .single();
+
+  if (!existing || existing.customer_id !== customerId) {
+    return sendJson(res, 404, { success: false, message: "Order not found" });
+  }
+
+  if (!existing.requires_evidence_approval) {
+    return sendJson(res, 400, { success: false, message: "Evidence tidak memerlukan persetujuan" });
+  }
+
+  const nextStatus = decision === "accept" ? "COMPLETED_PENDING_PAYMENT" : "NEEDS_REVISION";
+  const { error } = await supabaseAdmin
+    .from("orders")
+    .update({ status: nextStatus })
+    .eq("id", orderId);
+
+  if (error) return sendJson(res, 500, { success: false, message: error.message });
+
+  await appendTimeline(orderId, existing.status, nextStatus, "CUSTOMER", customerId, note || `Evidence ${decision}`);
+
+  return sendJson(res, 200, { success: true });
+}
 
EOF
)
