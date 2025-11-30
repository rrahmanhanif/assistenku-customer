import { clearBadgeUnread } from "../modules/badge";

useEffect(() => {
  clearBadgeUnread(orderId);
}, [orderId]);
