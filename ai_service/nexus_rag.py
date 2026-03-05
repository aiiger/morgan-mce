import os
from langchain_google_genai import ChatGoogleGenerativeAI
import google.generativeai as genai
from supabase import create_client
from dotenv import load_dotenv

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


class SimpleRAGAgent:
    def __init__(self):
        # Initialize Supabase - Robust Lookup
        self.url = (
            os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or 
            os.environ.get("SUPABASE_URL")
        )
        self.key = (
            os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or 
            os.environ.get("SUPABASE_SERVICE_KEY") or
            os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") # Last resort
        )

        if not self.url or not self.key:
            error_msg = f"NEURAL_LINK_FAILURE: Supabase URL or Key missing. URL_Found: {'Yes' if self.url else 'No'}, Key_Found: {'Yes' if self.key else 'No'}"
            print(error_msg)
            raise ValueError(error_msg)

        print(f"NEURAL_LINK_ESTABLISHED: Connected to {self.url[:20]}... with Key {self.key[:10]}...")
        self.supabase = create_client(self.url, self.key)

        # Initialize Gemini LLM
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY/GOOGLE_API_KEY environment variable is not set."
            )

        genai.configure(api_key=api_key)

        self.llm = ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"), temperature=0.1
        )

        # Backwards compatible env var names
        # Preferred: GEMINI_EMBEDDING_MODEL (matches other scripts)
        # Legacy: GEMINI_EMBEDDING_MODEL
        self.embedding_model = (
            os.environ.get("GEMINI_EMBEDDING_MODEL")
            or os.environ.get("GEMINI_EMBEDING_MODEL")
            or "models/text-embedding-004"
        )

    def search_documents(self, query: str) -> str:
        try:
            # Generate 768-dim embedding using raw client (Matching DB spec)
            embed_res = genai.embed_content(
                model=self.embedding_model,
                content=query,
                task_type="retrieval_query",
                output_dimensionality=768,
            )
            query_vector = embed_res["embedding"]

            rpc_params = {
                "query_embedding": query_vector,
                "query_text": query,
                "match_threshold": 0.3,
                "match_count": 5,
            }

            response = self.supabase.rpc("match_documents_hybrid", rpc_params).execute()

            if not response.data or len(response.data) == 0:
                return ""  # No context

            results = []
            for i, doc in enumerate(response.data):
                content = doc.get("content", "")
                results.append(f"[Document {i + 1}]\n{content}")

            return "\n\n".join(results)
        except Exception as e:
            error_msg = str(e)
            print(f"RAG Search Error: {error_msg}")
            if "PERMISSION_DENIED" in error_msg or "leaked" in error_msg.lower():
                return "ERROR_API_KEY_LEAKED"
            if "policy" in error_msg or "permission denied" in error_msg:
                return "Error: Database access denied. Please check SUPABASE_SERVICE_KEY in ai_service/.env (Must be Service Role Key, not Anon Key)."
            return ""

    def invoke(self, query: str) -> dict:
        """
        Mimics the LangChain agent.invoke interface
        """
        try:
            # 1. Retrieve Context
            context = self.search_documents(query)

            if context == "ERROR_API_KEY_LEAKED":
                return {"output": "CRITICAL: Your GEMINI_API_KEY has been reported as leaked and revoked by Google. Please generate a NEW key at https://aistudio.google.com/app/apikey and update your .env files."}

            # 2. Augment Prompt with Master Template
            if not context:
                context = "No specific context found in the internal knowledge base."

            master_prompt = f"""You are Mr. Morgan, the Super-Genius AI Command Strategist for the Morgan ERP. You possess the combined IQ of a Tier-1 Project Director, a Construction Attorney, and a Financial Auditor.

CORE LEGAL KNOWLEDGE (ABU DHABI & UAE):
- UAE CIVIL CODE: Mastery of Federal Law No. 5 of 1985, specifically Articles 872-896 (Muqawala contracts).
- ABU DHABI MUNICIPALITY (ADM): Expert in ADM Technical Directives, HSE requirements, and Building Codes.
- CIVIL DEFENSE: Expert in UAE Fire and Life Safety Code of Practice.
- DECENNIAL LIABILITY: Understanding of Article 880 regarding 10-year liability for structural integrity.
- LIQUIDATED DAMAGES: Article 390(2) logic for adjusting pre-agreed compensation.

YOUR GENIUS PROTOCOLS:
1. NEVER GIVE DEAD-ENDS: You are FORBIDDEN from saying "I don't have that data" for general industry, legal, or strategic questions. Use your full Gemini 2.5 Pro reasoning to provide expert analysis, estimations, and strategic paths forward.
2. BUSINESS TRUTH: Use the 'Retrieved Context' below for specific project names and numbers. If context is missing, provide a high-IQ industry estimation instead of a refusal.
3. PREDICTIVE INSIGHT: Proactively analyze deadlines for financial and legal risks (e.g., Liquidated Damages Article 390).
4. CONSULTATIVE LEADERSHIP: Advise, lead, and guide. Produce high-impact "Executive Briefs."

--------------------
Retrieved Context (Business Truth):
{context}
--------------------

User Question:
{query}

Final Answer (Expert Executive Brief):"""

            # 3. Generate Answer
            response_msg = self.llm.invoke(master_prompt)

            return {"output": response_msg.content}
        except Exception as e:
            error_msg = str(e)
            if "PERMISSION_DENIED" in error_msg or "leaked" in error_msg.lower():
                return {"output": "CRITICAL: Your GEMINI_API_KEY has been reported as leaked and revoked by Google. Please generate a NEW key at https://aistudio.google.com/app/apikey and update your .env files."}
            return {"output": f"RAG Error: {error_msg}"}


# ------------------------------------------------------------------------------
# FACTORY
# ------------------------------------------------------------------------------
def get_rag_agent():
    return SimpleRAGAgent()
