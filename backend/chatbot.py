
import os
import json
import time
import sys
from flask import Flask, request, jsonify

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
# import gradio as gr

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from typing_extensions import TypedDict, List
from langgraph.graph import START, StateGraph

# Import Mistral API integration
from langchain_mistralai import ChatMistralAI
try:
    from google.colab import userdata
except ImportError:
    userdata = None

# Access the secret
if userdata:
    api_key = userdata.get('MISTRAL_API_KEY')
else:
    # Use environment variable directly
    api_key = os.getenv("MISTRAL_API_KEY")

if not api_key:
    if __name__ == "__main__":
        print("Error: MISTRAL_API_KEY is not set in the environment variables. Please check your .env file.")
    sys.exit(1)

print("API key loaded successfully")
# Check that the file exists before trying to load it
if not os.path.exists('medical_knowledge_base.txt'):
    raise FileNotFoundError("The medical_knowledge_base.txt file is missing. Please upload it or check the path.")

# Load the plain text knowledge base
with open('medical_knowledge_base.txt', 'r', encoding='utf-8') as file:
    raw_text = file.read()

print("Knowledge base loaded successfully!")
print(f"Total characters: {len(raw_text)}")
print("\nFirst 300 characters preview:")
print(raw_text[:300])

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Split the raw text into meaningful chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,       # Each chunk ~ 800 characters
    chunk_overlap=100,    # 100 char overlap so context is not lost between chunks
    separators=["\n\n", "\n", "---", ".", " "]
)

raw_chunks = text_splitter.split_text(raw_text)

# Wrap each chunk in a Document object
documents = []
for i, chunk in enumerate(raw_chunks):
    doc = Document(
        page_content=chunk,
        metadata={
            "source": "medical_knowledge_base.txt",
            "chunk_id": i
        }
    )
    documents.append(doc)

print(f"Total chunks created: {len(documents)}")
print("\nSample chunk:")
print(documents[0].page_content[:300])

print(f"Loaded {len(documents)} document chunks from medical knowledge base")
print("\nSample document:")
print(f"Content: {documents[0].page_content[:300]}...")

# Use the chunks directly as our splits
all_splits = documents
print(f"Total document chunks ready for embedding: {len(all_splits)}")

print(f"Number of document chunks: {len(all_splits)}")
print(f"Sample chunk: {all_splits[0].page_content[:200]}...")
print(f"Sample chunk metadata: {all_splits[0].metadata}")
# Initialize embedding model (open source)
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'}
)
# Create vector store from documents
vector_store = Chroma.from_documents(
    documents=all_splits,
    embedding=embeddings,
    collection_name="medical_knowledge_base"
)

print("Vector store created successfully!")
print(f"Total vectors stored: {len(all_splits)}")
# Test similarity search with a medical query
test_query = "What medicines are used for fever?"
similar_docs = vector_store.similarity_search(test_query, k=2)
print(f"Test query: '{test_query}'")
for i, doc in enumerate(similar_docs):
    print(f"\nResult {i+1}: {doc.page_content[:200]}...")
# Initialize LLM - using Mistral's API with their free small model
llm = ChatMistralAI(
    api_key=api_key,
    model="mistral-small-latest",
    temperature=0.5,  # Controls randomness in the model's responses
    max_tokens=512    # Limits response length to approximately 400-500 words
)
# Define our custom medical assistant prompt
custom_prompt_template = """You are a helpful medical information assistant.
Use ONLY the following retrieved information from the medical knowledge base to answer the user's question.
If the answer is not found in the provided context, say: "I don't have information on that. Please consult a doctor."

IMPORTANT DISCLAIMER: Always remind the user to consult a licensed doctor before taking any medication.

User Question: {question}

Retrieved Medical Information:
{context}

Answer:"""

custom_prompt = PromptTemplate.from_template(custom_prompt_template)
# Define state for application
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str
# Define retrieval function
def retrieve(state: State):
    """Retrieve relevant documents from vector store"""
    # Get the top 3 most relevant Q&A pairs
    retrieved_docs = vector_store.similarity_search(state["question"], k=3)
    return {"context": retrieved_docs}
# Define generation function
def generate(state: State):
    """Generate an answer using Mistral's API"""
    # Format the retrieved Q&A pairs as context
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])

    # Format with our custom prompt for Mistral API
    messages = custom_prompt.invoke({"question": state["question"], "context": docs_content})

    # Get response from Mistral API
    response = llm.invoke(messages)

    return {"answer": response.content}
# Build and compile the graph
graph_builder = StateGraph(State).add_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()
def ask_question(question: str):
    """Helper function to ask a question and return the answer along with context."""
    result = graph.invoke({"question": question})

    print(f"Question: {question}\n")
    print(f"Answer: {result['answer']}\n")
    print("Context used:")
    for i, doc in enumerate(result["context"]):
        source_info = f"Document {i+1} (category: {doc.metadata.get('category', 'unknown')})"
        print(f"{source_info}")
        print(f"Original question: {doc.metadata.get('question', 'unknown')}")
        print(f"Content snippet: {doc.page_content[:150]}...\n")

    return result
# print("Testing our Medical RAG system with sample questions:\n")
# print("-" * 50)
# result1 = ask_question("What are the symptoms of dengue fever?")
# print("-" * 50)
# result2 = ask_question("What medicines can I take for a headache?")
# print("-" * 50)
# result3 = ask_question("What diet should I follow during fever?")

from langgraph.graph import MessagesState

# Initialize graph with message-based state
graph_builder = StateGraph(MessagesState)
from langchain_core.messages import SystemMessage, ToolMessage, HumanMessage

# Retrieval component: Always retrieve information for every user message
def retrieve(state: MessagesState):
    """Retrieve information related to a query."""
    # Extract the last user message
    user_message = None
    for message in reversed(state["messages"]):
        if message.type == "human":
            user_message = message.content
            break

    if not user_message:
        return {"messages": []}

    # Perform retrieval
    retrieved_docs = vector_store.similarity_search(user_message, k=2)

    # Format retrieved documents as tool messages
    tool_messages = []
    for doc in retrieved_docs:
        content = f"Source: {doc.metadata}\nContent: {doc.page_content}"
        tool_messages.append(ToolMessage(content=content, tool_call_id="retrieve_call"))

    # Return tool messages to be added to the state
    return {"messages": tool_messages}
# Generation component: Generate responses based on retrieved information

def generate(state: MessagesState):
    """Generate answer based on retrieved medical content."""
    # Get generated ToolMessages
    tool_messages = [msg for msg in state["messages"] if msg.type == "tool"]

    # Format into prompt
    docs_content = "\n\n".join(doc.content for doc in tool_messages)
    system_message_content = (
        "You are a helpful medical information assistant. "
        "Use ONLY the following retrieved information from the medical knowledge base to answer the user's question. "
        "If the answer is not in the provided context, say: 'I don't have information on that. Please consult a licensed doctor.' "
        "Always remind the user to consult a doctor before taking any medication. "
        "\n\n"
        f"{docs_content}"
    )

    # Get conversation history (only human and AI messages)
    conversation_messages = [
        message for message in state["messages"]
        if message.type in ("human", "ai")
    ]

    # Construct the full prompt with system message and conversation
    prompt = [SystemMessage(system_message_content)] + conversation_messages

    # Run the LLM to generate a response
    response = llm.invoke(prompt)

    return {"messages": [response]}
from langgraph.graph import END

# Add our components as nodes in the graph
graph_builder.add_node("retrieve", retrieve)
graph_builder.add_node("generate", generate)

# Set the entry point - always start with retrieval
graph_builder.set_entry_point("retrieve")

# Define the flow: always go from retrieve to generate
graph_builder.add_edge("retrieve", "generate")
graph_builder.add_edge("generate", END)

# Compile the graph
graph = graph_builder.compile()

# Test multi-turn medical conversation
def test_conversation():
    print("==== Starting a new medical conversation ====")

    first_message = "What are the symptoms of typhoid?"
    print(f"User: {first_message}")

    result = graph.invoke(
        {"messages": [{"role": "user", "content": first_message}]},
        config={"configurable": {"thread_id": "test-session-1"}}
    )

    for msg in reversed(result["messages"]):
        if msg.type == "ai":
            print(f"Assistant: {msg.content}")
            break

    print("\n" + "-"*50)

    # Follow-up question (tests memory)
    second_message = "What diet should I follow for it?"
    print(f"\nUser: {second_message}")

    result2 = graph.invoke(
        {"messages": [{"role": "user", "content": second_message}]},
        config={"configurable": {"thread_id": "test-session-1"}}
    )

    for msg in reversed(result2["messages"]):
        if msg.type == "ai":
            print(f"Assistant: {msg.content}")
            break
# Run the test
# test_conversation()
# Dictionary to store conversation history for different sessions
sessions = {}

# Create the Gradio interface
def create_demo():
    """Create a Gradio web interface for our Medical RAG chatbot."""
    with gr.Blocks(css="footer {visibility: hidden}") as demo:
        gr.Markdown("# 🏥 Medical Knowledge RAG Assistant")
        gr.Markdown("Ask questions about symptoms, medicines, diet, and home remedies. **Always consult a licensed doctor before taking medication.**")

        # Create a unique session ID for this chat instance
        session_id = f"session-{hash(str(time.time()))}"

        # Create three simple UI elements
        chatbot = gr.Chatbot(height=500, type="messages")
        msg = gr.Textbox(label="Your Medical Question", placeholder="e.g. What are the symptoms of dengue? What medicines help with fever?")
        clear = gr.Button("Clear Conversation")

        # Define function to handle each user message
        def respond(message, chat_history):
            if not message:
                return "", chat_history

            # Get response from our RAG system
            bot_message = process_message(message, chat_history, session_id)

            # Update chat history
            chat_history.append({"role": "user", "content": message})
            chat_history.append({"role": "assistant", "content": bot_message})
            return "", chat_history

        # Connect the UI components
        msg.submit(respond, [msg, chatbot], [msg, chatbot])
        clear.click(lambda: None, None, chatbot, queue=False)

    return demo

# # Create the Gradio application
# demo = create_demo()


# def process_message(message, history, session_id=None):
#     """Process a message in the context of a conversation history.
#     Args:
#       message (str): The user's message
#       history (list): The current UI conversation history (from Gradio)
#       session_id (str, optional): Unique identifier for this conversation

#     Returns:
#         response (str): The assistant's response
#     """
#     # Generate a session ID if not provided
#     if session_id is None:
#         session_id = f"session-{hash(str(time.time()))}"

#     # Configure the graph to use this session ID
#     config = {"configurable": {"thread_id": session_id}}

#     try:
#         # Invoke the graph with the new message
#         result = graph.invoke(
#             {"messages": [{"role": "user", "content": message}]},
#             config=config,
#         )

#         # Extract the assistant's response
#         for msg in reversed(result["messages"]):
#             if msg.type == "ai":
#                 response = msg.content
#                 break

#         # Store the updated session for future reference
#         sessions[session_id] = result

#         return response
#     except Exception as e:
#         return f"An error occurred: {str(e)}. Please try a different question."

@app.route('/chatbot', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get("messages", [])
        if not messages:
            user_msg = data.get("message", "")
            if user_msg:
                messages = [{"role": "user", "text": user_msg, "isBot": False}]
        
        # Convert frontend messages format to Langchain MessagesState format
        formatted_messages = []
        for m in messages:
            role = "assistant" if m.get("isBot") else "user"
            content = m.get("text", "")
            formatted_messages.append({"role": role, "content": content})
        
        session_id = data.get("session_id", f"session-{hash(str(time.time()))}")
        
        config = {"configurable": {"thread_id": session_id}}
        result = graph.invoke({"messages": formatted_messages}, config=config)
        
        response_text = ""
        for msg in reversed(result["messages"]):
            if msg.type == "ai":
                response_text = msg.content
                break
        
        return jsonify({"reply": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting Chatbot Flask server on port 5001...")
    app.run(port=5001, debug=False)