import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VideoChat({ targetUserId, onCallEnded }) {
    const { user } = useAuth();
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const socket = useRef();

    useEffect(() => {
        socket.current = io('http://localhost:3000');
        socket.current.emit('join_room', user.id || user.userId);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
        }).catch(err => {
            toast.error("Kamera ve mikrofon izni verilmedi.");
            console.error(err);
        });

        socket.current.on("callUser", (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setName(data.name);
            setCallerSignal(data.signal);
        });

        socket.current.on("callEnded", () => {
            setCallEnded(true);
            if (connectionRef.current) connectionRef.current.destroy();
            window.location.reload(); // Quick reset
        });

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (socket.current) socket.current.disconnect();
        };
    }, []);

    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.current.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: user.id || user.userId,
                name: user.name
            });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        socket.current.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.current.emit("answerCall", { signal: data, to: caller });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();
        socket.current.emit("endCall", { to: targetUserId || caller });
        onCallEnded();
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* My Video */}
                <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-2xl border border-gray-700">
                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-xs">
                        Siz ({user.name})
                    </div>
                </div>

                {/* User Video */}
                <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-2xl border border-gray-700">
                    {callAccepted && !callEnded ? (
                        <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            {receivingCall && !callAccepted ? "Arama Bekleniyor..." : "Bağlantı Bekleniyor..."}
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-xs">
                        {callAccepted ? "Katılımcı" : "Bekleniyor"}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                {!callAccepted && !receivingCall && targetUserId && (
                    <button onClick={() => callUser(targetUserId)} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-all flex items-center gap-2">
                        📞 Aramayı Başlat
                    </button>
                )}

                {receivingCall && !callAccepted && (
                    <button onClick={answerCall} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold animate-pulse hover:bg-green-700 transition-all flex items-center gap-2">
                        📞 Aramaya Cevap Ver
                    </button>
                )}

                <button onClick={leaveCall} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all flex items-center gap-2">
                    🚫 Görüşmeyi Sonlandır
                </button>
            </div>
        </div>
    );
}
