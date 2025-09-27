import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';

const CopilotAssistant = ({ onSuggestion }) => {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: "Hello! I'm your Infinity assistant. I can help you write Decision Table rules, create DMN models, and debug your business logic. Try asking me about rule syntax or decision table best practices!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const mockResponses = [
    {
      trigger: ['age', 'validation', 'person'],
      response: "Here's a sample DRL rule for age validation:\n\nrule \"Age Validation\"\nwhen\n $person : Person(age >= 18)\nthen\n $person.setStatus(\"Adult\");\n System.out.println(\"Person is an adult\");\nend"
    },
    {
      trigger: ['income', 'check', 'salary'],
      response: "For income validation, you can use:\n\nrule \"Income Check\"\nwhen\n $person : Person(income > 50000)\nthen\n $person.setEligible(true);\n System.out.println(\"Person is eligible\");\nend"
    },
    {
      trigger: ['dmn', 'decision', 'table'],
      response: "For DMN decision tables, consider these best practices:\n1. Use clear, descriptive column headers\n2. Order rules from most specific to least specific\n3. Use UNIQUE hit policy when only one rule should fire\n4. Test all possible input combinations"
    },
    {
      trigger: ['feel', 'expression'],
      response: "FEEL expressions in DMN support:\n- Comparison operators: >, <, >=, <=, =, !=\n- Range expressions: [18..65], (0..100)\n- List expressions: \"A\", \"B\", \"C\"\n- Boolean logic: and, or, not"
    },
    {
      trigger: ['conflict', 'overlap', 'error'],
      response: "Rule conflicts can occur when:\n1. Multiple rules have identical conditions\n2. Rules have overlapping ranges\n3. Rule ordering creates unreachable conditions\n\nUse the conflict detector to identify and resolve these issues."
    },
    {
      trigger: ['salience', 'priority'],
      response: "Salience controls rule execution order:\n\nrule \"High Priority Rule\"\nsalience 100\nwhen\n // conditions\nthen\n // actions\nend\n\nHigher numbers execute first. Default salience is 0."
    }
  ];

  const getResponse = (userInput) => {
    const input = userInput.toLowerCase();
    for (const mockResponse of mockResponses) {
      if (mockResponse.trigger.some(t => input.includes(t))) {
        return mockResponse.response;
      }
    }
    // Default responses
    const defaultResponses = [
      'I can help you with DRL rules and DMN decision tables. What specific topic would you like to explore?',
      'Try asking about rule syntax, decision table design, or conflict resolution.',
      'Would you like me to show you an example of a specific rule pattern?',
      'I can explain FEEL expressions, salience, or help debug your rules.'
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = getResponse(currentInput);
      setMessages(msgs => [...msgs, { type: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  const clearConversation = () => {
    setMessages([
      {
        type: 'assistant',
        content: "Hello! I'm your Drools assistant. How can I help you with your business rules today?"
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-blue-50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">Infinity Assistant</span>
        </div>
        <button
          onClick={clearConversation}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
          title="Clear conversation"
        >
          🗑️
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.type === 'user'
                ? 'bg-blue-100 ml-4'
                : 'bg-gray-100 mr-4'
            }`}
          >
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            {message.type === 'assistant' && message.content.includes('rule ') && (
              <button
                onClick={() => onSuggestion && onSuggestion(message.content)}
                className="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Apply to Editor
              </button>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="bg-gray-100 mr-4 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              <span className="text-sm text-gray-600 ml-2">Assistant is thinking...</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
            placeholder="Ask about DRL rules, DMN decisions..."
            disabled={isTyping}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || !input.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Mock Assistant • {messages.filter(m => m.type === 'user').length} messages sent
        </div>
      </div>
    </div>
  );
};

export default CopilotAssistant;
