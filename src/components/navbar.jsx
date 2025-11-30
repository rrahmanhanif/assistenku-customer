import { getUnreadCount } from "../modules/badge";

export default function Navbar() {
  const unread = getUnreadCount();

  return (
    <div className="nav">
      <a href="/chat" className="nav-item chat-icon">
        Chat
        {unread > 0 && (
          <span className="badge-red">{unread}</span>
        )}
      </a>
    </div>
  );
}
