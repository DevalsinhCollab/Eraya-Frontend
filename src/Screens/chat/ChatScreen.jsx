import { Avatar, IconButton } from '@mui/material';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { useSocket } from '../../SocketContext';
import { apisHeaders } from '../../common/apisHeaders';
import SendIcon from '@mui/icons-material/Send';
import ChatStyle from './chat.module.scss';
import { docSpecialityData } from '../../common/common';
import userImg from '../../Img/user2.jpeg';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideocamIcon from '@mui/icons-material/Videocam';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

export default function ChatScreen() {
  const { prbId, senderId, receiverId } = useParams();
  const socket = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  // const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { loggedIn } = useSelector((state) => state.authData);

  const generateRoomId = (id1, id2) => {
    return [id1, id2].sort().join('_');
  };

  const roomId = generateRoomId(senderId, receiverId);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinChatRoom', { senderId, roomId });

    socket.on('receiveMessage', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      if (msg.receiverId === loggedIn?._id) {
        socket.emit('markAsRead', { messageId: msg._id });
      }
    });

    // socket.on('typing', ({ senderId }) => {
    //   setIsTyping(true);
    // });

    // socket.on('stopTyping', ({ senderId }) => {
    //   setIsTyping(false);
    // });

    const fetchMessages = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_API}/msg/getchat`,
          { prbId: prbId, senderId: senderId, receiverId: receiverId },
          apisHeaders,
        );
        setMessages(response?.data?.messages);
        setReceiver(response?.data?.receiver);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    return () => {
      // socket.off('typing');
      // socket.off('stopTyping');
      socket.off('receiveMessage');
      socket.emit('leaveChatRoom', { senderId, roomId });
    };
  }, [prbId, receiverId, senderId, roomId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message) {
      return toast.warning('Please enter a message');
    }
    if (message.trim()) {
      socket.emit('sendMessage', {
        senderId: senderId,
        receiverId: receiverId,
        message,
        senderName: loggedIn?.name,
        roomId: roomId,
        prbId: prbId,
      });
      setMessage('');
      // socket.emit('stopTyping', { senderId, receiverId });
    }
  };

  // const handleTyping = () => {
  //   socket.emit('typing', { senderId, receiverId });
  // };

  // const handleStopTyping = () => {
  //   socket.emit('stopTyping', { senderId, receiverId });
  // };

  // useEffect(() => {
  //   socket.on('notifyUser', (notification) => {
  //     // console.log(notification);
  //     if (notification.receiverId === loggedIn?._id) {
  //       console.log('notification---', notification);
  //       // setNotification((oldNotification) => [...oldNotification, notification.message]);
  //       toast.info(notification.title);
  //       dispatch(addNotification(notification));
  //       dispatch(updateUnreadMsgCount());
  //     }
  //   });
  // }, [messages]);

  return (
    <div className={ChatStyle.main}>
      <div className={ChatStyle.userBox}>
        <IconButton
          sx={{
            backgroundColor: '#24266C',
            transition: 'all.2s ease-in-out',
            '&:hover': {
              backgroundColor: '#24266C',
              scale: '.9',
            },
          }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon sx={{ color: '#fff' }} />
        </IconButton>
        <div className={ChatStyle.userDetails}>
          <Avatar alt="Receiver Img" src={userImg} sx={{ height: '100px', width: '100px' }} />
          <div>
            <h2>{receiver?.name}</h2>
            <h4 className={ChatStyle.userSubTitle}>
              {receiver?.role === 'D' ? docSpecialityData[receiver?.docSpeciality] : 'User'}
            </h4>
          </div>
          <div className={ChatStyle.options}>
            <div>
              <IconButton className={ChatStyle.cIcon}>
                <ChatBubbleIcon sx={{ color: '#24266C', fontSize: 28 }} />
              </IconButton>
              <h5 style={{ marginTop: '5px',textAlign:"center" }}>Chat</h5>
            </div>
            <div>
              <IconButton className={ChatStyle.vcIcon}>
                <VideocamIcon sx={{ color: '#24266C' }} fontSize="large" />
              </IconButton>
              <h5 style={{ marginTop: '5px',textAlign:"center" }}>Video Call</h5>
            </div>
          </div>
        </div>
      </div>
      <div className={ChatStyle.chatBox}>
        <div className={ChatStyle.msgBox}>
          {messages?.map((msg, index) => (
            <div key={index}>
              {/* {showMsgTime(msg.timestamp) >= 24 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span
                  style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '5px',
                  }}
                >
                  {msgDateFormate(msg.timestamp)}
                </span>
              </div>
            )} */}
              <div
                key={index}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: `${loggedIn._id === msg.senderId ? 'end' : 'start'}`,
                  marginTop: '5px',
                }}
              >
                <div
                  style={{
                    width: 'auto',
                    fontSize: '1.050rem',
                    fontWeight: '505',
                    color: loggedIn._id === msg.senderId ? '#fff' : '#000',
                    backgroundColor: loggedIn._id === msg.senderId ? '#2d307e' : '#fff',
                    border:
                      loggedIn._id === msg.senderId ? '1px solid transparent' : '1px solid #2d307e',
                    padding: '5px 8px',
                    borderRadius:
                      loggedIn._id === msg.senderId ? '10px 10px 0px 10px' : '10px 10px 10px 0px',
                  }}
                >
                  {msg.message}
                  {/* <div style={{ fontSize: '10px' }}>{msgDateTimeFormate(msg.timestamp)}</div> */}
                  <div style={{ fontSize: '12px' }}>{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {/* {isTyping && <div>Typing...</div>} */}
        </div>
        <form onSubmit={sendMessage} style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #24266C',
                outline: 'none',
                padding: '.5rem .8rem',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '5rem',
              }}
              placeholder="Write Something..."
              // onKeyPress={handleTyping}
              // onBlur={handleStopTyping}
              // onKeyUp={handleStopTyping}
            />
            <IconButton
              sx={{
                backgroundColor: '#24266C',
                transition: 'all.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#24266C',
                  scale: '.9',
                },
              }}
              type="submit"
            >
              <SendIcon sx={{ color: '#fff' }} />
            </IconButton>
          </div>
        </form>
      </div>
    </div>
  );
}
