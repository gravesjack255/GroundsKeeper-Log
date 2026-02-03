import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { 
  useConversations, 
  useMessages, 
  useSendMessage,
  useMarkMessagesAsRead 
} from "@/hooks/use-marketplace";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { 
  MessageSquare, 
  Send, 
  Package,
  ArrowLeft,
  User
} from "lucide-react";
import { format } from "date-fns";

export default function Messages() {
  const { data: conversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<{
    listingId: number;
    otherUserId: string;
    otherUserName: string | null;
    equipmentName: string;
  } | null>(null);
  
  const { data: messages } = useMessages(
    selectedConversation?.listingId || 0,
    selectedConversation?.otherUserId || ''
  );
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesAsRead();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation && messages?.some(m => m.senderId !== user?.id && !m.isRead)) {
      markAsRead.mutate({
        listingId: selectedConversation.listingId,
        senderId: selectedConversation.otherUserId,
      });
    }
  }, [selectedConversation, messages, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessage.mutate({
      listingId: selectedConversation.listingId,
      receiverId: selectedConversation.otherUserId,
      content: newMessage.trim(),
    }, {
      onSuccess: () => {
        setNewMessage('');
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 md:col-span-2" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {conversations?.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start a conversation by messaging a seller on a marketplace listing.
            </p>
            <Link href="/marketplace">
              <Button data-testid="button-browse-marketplace">Browse Marketplace</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="h-[calc(100vh-200px)] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto h-[calc(100%-60px)]">
                {conversations?.map((conv) => (
                  <button
                    key={`${conv.listingId}-${conv.otherUserId}`}
                    onClick={() => setSelectedConversation({
                      listingId: conv.listingId,
                      otherUserId: conv.otherUserId,
                      otherUserName: conv.otherUserName,
                      equipmentName: conv.listing.equipment.name,
                    })}
                    className={`w-full p-3 text-left border-b hover-elevate ${
                      selectedConversation?.listingId === conv.listingId && 
                      selectedConversation?.otherUserId === conv.otherUserId
                        ? 'bg-accent'
                        : ''
                    }`}
                    data-testid={`conversation-${conv.listingId}-${conv.otherUserId}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {conv.otherUserName || 'User'}
                          </span>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.listing.equipment.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="md:col-span-2 h-[calc(100vh-200px)] flex flex-col overflow-hidden">
              {selectedConversation ? (
                <>
                  <CardHeader className="pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {selectedConversation.otherUserName || 'User'}
                        </CardTitle>
                        <Link href={`/marketplace/${selectedConversation.listingId}`}>
                          <p className="text-xs text-muted-foreground hover:underline">
                            Re: {selectedConversation.equipmentName}
                          </p>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                          data-testid={`message-${msg.id}`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderId === user?.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {format(new Date(msg.createdAt!), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </CardContent>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="resize-none"
                        rows={2}
                        data-testid="input-message"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sendMessage.isPending}
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                    <p>Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
