'use client';



import { useCallback, useEffect, useRef, useState } from 'react';

import { Loader2, Send, Sparkles, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useToastStore } from '@/components/ui/toaster';

import { getNetworkErrorMessage } from '@/features/auth/services/apiClient';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

import {

  STYLIST_CHAT_GREETING,

  STYLIST_QUICK_PROMPTS,

} from '@/features/stylist-chat/constants/stylistChatOptions';

import { sendStylistChatMessage } from '@/features/stylist-chat/services/stylistChatService';



function TypingIndicator() {

  return (

    <div className="flex items-center gap-1.5 px-4 py-3">

      <span className="h-2 w-2 animate-bounce rounded-full bg-magenta [animation-delay:-0.2s]" />

      <span className="h-2 w-2 animate-bounce rounded-full bg-magenta [animation-delay:-0.1s]" />

      <span className="h-2 w-2 animate-bounce rounded-full bg-magenta" />

    </div>

  );

}



function formatAssistantContent(content) {

  return content.split('\n').map((line, index) => {

    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);



    return (

      <span key={`line-${index}`}>

        {index > 0 && <br />}

        {parts.map((part, partIndex) => {

          if (part.startsWith('**') && part.endsWith('**')) {

            return (

              <strong key={`part-${partIndex}`} className="font-semibold text-slate-900 dark:text-white">

                {part.slice(2, -2)}

              </strong>

            );

          }

          return <span key={`part-${partIndex}`}>{part}</span>;

        })}

      </span>

    );

  });

}



function ChatBubble({ message }) {

  const isUser = message.role === 'user';



  return (

    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>

      <div

        className={cn(

          'max-w-[88%] px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-300',

          isUser

            ? 'rounded-2xl rounded-br-md bg-magenta text-white'

            : 'rounded-2xl rounded-bl-md border border-borderColor bg-white dark:bg-[#150d22] text-slate-700 dark:text-gray-400 shadow-sm',

        )}

      >

        {isUser ? message.content : formatAssistantContent(message.content)}

      </div>

    </div>

  );

}



export function StylistChatbot() {

  const showToast = useToastStore((state) => state.showToast);

  const accessToken = useAuthStore((state) => state.accessToken);



  const [isOpen, setIsOpen] = useState(false);

  const [input, setInput] = useState('');

  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([

    { role: 'assistant', content: STYLIST_CHAT_GREETING },

  ]);



  const scrollRef = useRef(null);

  const inputRef = useRef(null);



  const scrollToBottom = useCallback(() => {

    scrollRef.current?.scrollTo({

      top: scrollRef.current.scrollHeight,

      behavior: 'smooth',

    });

  }, []);



  useEffect(() => {

    scrollToBottom();

  }, [messages, isTyping, scrollToBottom]);



  useEffect(() => {

    if (isOpen) {

      const timer = setTimeout(() => inputRef.current?.focus(), 280);

      return () => clearTimeout(timer);

    }

    return undefined;

  }, [isOpen]);



  const sendMessage = async (rawText) => {

    const text = rawText.trim();

    if (!text || isTyping) return;



    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    setInput('');

    setIsTyping(true);



    try {

      const response = await sendStylistChatMessage(text, { token: accessToken });

      setMessages((prev) => [

        ...prev,

        { role: 'assistant', content: response.reply ?? 'Let me know how I can help with your look.' },

      ]);

    } catch (error) {

      showToast({ message: getNetworkErrorMessage(error), variant: 'destructive' });

      setMessages((prev) => [

        ...prev,

        {

          role: 'assistant',

          content:

            'I had trouble connecting to the stylist engine. Please try again in a moment.',

        },

      ]);

    } finally {

      setIsTyping(false);

    }

  };



  const handleSubmit = (event) => {

    event.preventDefault();

    sendMessage(input);

  };



  return (

    <>

      <div

        className={cn(

          'pointer-events-none fixed bottom-[5.5rem] right-4 z-[55] flex flex-col items-end gap-3 md:bottom-6 md:right-6',

          isOpen && 'pointer-events-auto',

        )}

      >

        <div

          className={cn(

            'pointer-events-auto w-[min(100vw-2rem,24rem)] origin-bottom-right transition-all duration-300 ease-out',

            isOpen

              ? 'scale-100 opacity-100'

              : 'pointer-events-none scale-95 opacity-0',

          )}

          aria-hidden={!isOpen}

        >

          <div

            role="dialog"

            aria-modal="true"

            aria-label="AI Stylist chat"

            className={cn(

              'flex h-[min(70dvh,32rem)] flex-col overflow-hidden rounded-2xl border border-borderColor bg-white dark:bg-[#150d22] shadow-md',

            )}

          >

            <header className="flex items-center justify-between border-b border-borderColor bg-background/80 px-4 py-3">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-magenta text-[#7c3aed] shadow-inner">

                  <Sparkles className="h-4 w-4" />

                </div>

                <div>

                  <h3 className="font-playfair text-sm font-semibold text-slate-900 dark:text-white">

                    AI Stylist

                  </h3>

                </div>

              </div>

              <button

                type="button"

                onClick={() => setIsOpen(false)}

                className="rounded-full p-2 text-slate-700 dark:text-gray-400 transition-colors hover:bg-gray-100 hover:text-slate-900 dark:hover:text-white"

                aria-label="Close chat"

              >

                <X className="h-4 w-4" />

              </button>

            </header>



            <div

              ref={scrollRef}

              className="flex-1 space-y-4 overflow-y-auto bg-background/40 px-4 py-4"

            >

              {messages.map((message, index) => (

                <ChatBubble key={`${message.role}-${index}`} message={message} />

              ))}



              {isTyping && (

                <div className="flex justify-start">

                  <div className="rounded-2xl rounded-bl-md border border-borderColor bg-white dark:bg-[#150d22] shadow-sm">

                    <TypingIndicator />

                  </div>

                </div>

              )}

            </div>



            {!isTyping && messages.length <= 1 && (

              <div className="flex flex-wrap gap-2 border-t border-borderColor bg-white dark:bg-[#150d22] px-4 py-3">

                {STYLIST_QUICK_PROMPTS.map((prompt) => (

                  <button

                    key={prompt}

                    type="button"

                    onClick={() => sendMessage(prompt)}

                    className="rounded-full border border-borderColor bg-white dark:bg-[#150d22] px-3 py-1.5 text-left text-[11px] font-medium text-slate-700 dark:text-gray-400 transition-colors hover:border-magenta/40 hover:text-magenta"

                  >

                    {prompt}

                  </button>

                ))}

              </div>

            )}



            <form

              onSubmit={handleSubmit}

              className="flex items-center gap-2 border-t border-borderColor bg-white dark:bg-[#150d22] p-3"

            >

              <input

                ref={inputRef}

                type="text"

                value={input}

                onChange={(event) => setInput(event.target.value)}

                placeholder="Ask for outfit advice..."

                disabled={isTyping}

                className="min-w-0 flex-1 rounded-full border border-borderColor bg-white dark:bg-[#150d22] px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-shadow placeholder:text-slate-700 dark:text-gray-400 focus:border-magenta focus:ring-2 focus:ring-[#e91e8c]/15 disabled:opacity-60"

              />

              <button

                type="submit"

                disabled={!input.trim() || isTyping}

                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-magenta text-white transition-all hover:bg-magenta/80 disabled:cursor-not-allowed disabled:bg-gray-300"

                aria-label="Send message"

              >

                {isTyping ? (

                  <Loader2 className="h-4 w-4 animate-spin" />

                ) : (

                  <Send className="h-4 w-4" />

                )}

              </button>

            </form>

          </div>

        </div>



        <button

          type="button"

          onClick={() => setIsOpen((open) => !open)}

          className={cn(

            'pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',

            'bg-magenta text-[#7c3aed] ring-2 ring-[#e91e8c]/20 hover:scale-105 hover:ring-[#e91e8c]/40',

            isOpen && 'bg-[#c4186f] text-slate-900 dark:text-white ring-[#7c3aed]/30',

          )}

          aria-label={isOpen ? 'Close AI Stylist' : 'Open AI Stylist'}

          aria-expanded={isOpen}

        >

          {isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}

        </button>

      </div>

    </>

  );

}


