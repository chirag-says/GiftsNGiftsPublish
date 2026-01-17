import React, { useEffect, useState } from 'react';
import api from "../../utils/api";

function ChatCustomers() {
  const [chats, setChats] = useState([]);
  useEffect(() => {
    api.get('/api/communication/chat-customers')
      .then(res => setChats(res.data.data))
      .catch(console.error);
  }, []);
  return (
    <div className="container card bg-white shadow-md rounded px-10">
      <h1 className="text-[18px] py-4 font-[600]">Chat with Customers</h1>
      <ul>
        {chats.map(c => (
          <li key={c.id}><b>{c.customer}</b>: {c.message}</li>
        ))}
      </ul>
    </div>
  );
}
export default ChatCustomers;
