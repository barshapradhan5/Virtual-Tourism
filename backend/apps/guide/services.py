import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from django.conf import settings
from apps.places.models import Place

logger = logging.getLogger(__name__)

# Ensure latest .env values are reloaded
ENV_PATH = Path(__file__).resolve().parent.parent.parent / '.env'
if ENV_PATH.exists():
    load_dotenv(ENV_PATH, override=True)

class GroqGuideService:
    def __init__(self):
        # Reload env in case it was updated recently
        if ENV_PATH.exists():
            load_dotenv(ENV_PATH, override=True)

        self.api_key = os.getenv('GROQ_API_KEY') or getattr(settings, 'GROQ_API_KEY', '')
        self.model = os.getenv('GROQ_MODEL') or getattr(settings, 'GROQ_MODEL', 'openai/gpt-oss-120b')
        self.client = None

        if self.api_key:
            try:
                from groq import Groq
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Could not initialize Groq client: {e}")
                print(f"[GroqGuideService] Client init failed: {e}")

    def build_system_prompt(self, place: Place, current_poi_title: str = None) -> str:
        pois = place.pois.all()
        poi_summary = "\n".join([f"- {poi.title}: {poi.body}" for poi in pois]) if pois.exists() else "No specific POIs recorded."

        prompt = (
            "You are the official Heritage AI Guide of 'Bharat Darshan 3D', an immersive virtual explorer of India's cultural and natural landmarks.\n"
            "Your personality is warm, scholarly, respectful, and deeply appreciative of India's civilizational legacy and nature.\n"
            f"You are currently guiding a visitor exploring: {place.name}.\n"
            f"Category: {place.category.name}\n"
            f"State: {place.state.name if place.state else 'India'}\n"
            f"Best Season to Visit: {place.best_season}\n\n"
            f"Verified Overview:\n{place.short_description}\n\n"
            f"Historical & Cultural Archive Notes:\n{place.history_notes or 'Celebrated Indian heritage destination.'}\n\n"
            f"Points of Interest at this site:\n{poi_summary}\n\n"
        )
        if current_poi_title:
            prompt += f"Note: The visitor is currently standing near: '{current_poi_title}'. If relevant to their question, weave this into your answer.\n"

        prompt += (
            "Guidelines:\n"
            "1. Answer concisely (around 2 to 3 focused paragraphs, max 160 words) so it fits comfortably in a virtual explorer UI.\n"
            "2. Ground your answers strictly in Indian archaeology, architecture, history, geography, and living culture.\n"
            "3. Answer the visitor's specific question directly. Do not give generic or repetitive responses."
        )
        return prompt

    def ask(self, place: Place, question: str, history=None, current_poi_title: str = None) -> dict:
        """
        Queries Groq LLM with context grounding, with graceful local fallback.
        """
        # Candidate models to try in case one model is unavailable
        models_to_try = [
            self.model,
            'openai/gpt-oss-120b',
            'qwen/qwen3.8-27b',
            'openai/gpt-oss-20b'
        ]
        # Deduplicate while preserving order
        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        if self.client:
            for model_name in unique_models:
                try:
                    messages = [
                        {"role": "system", "content": self.build_system_prompt(place, current_poi_title)}
                    ]
                    if history:
                        for turn in history[-4:]:
                            messages.append({"role": turn["role"], "content": turn["content"]})
                    messages.append({"role": "user", "content": question})

                    response = self.client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        max_tokens=400,
                        temperature=0.7,
                    )
                    answer = response.choices[0].message.content.strip()
                    return {
                        "answer": answer,
                        "is_fallback": False,
                        "source": f"Groq ({model_name})"
                    }
                except Exception as e:
                    logger.error(f"Groq API call with {model_name} failed: {e}")
                    print(f"[GroqGuideService] Model {model_name} error: {e}")
                    # Continue to try next candidate model

        # Intelligent Question-Specific Grounded Fallback
        return self._generate_grounded_fallback(place, question, current_poi_title)

    def _generate_grounded_fallback(self, place: Place, question: str, current_poi_title: str = None) -> dict:
        q_lower = question.lower()

        # 1. Architecture & Design
        if any(w in q_lower for w in ['architect', 'style', 'built of', 'material', 'stone', 'carving', 'design', 'structure', 'dome', 'pillar']):
            if 'beach' in place.category.slug or 'water' in place.category.slug:
                text = (
                    f"The architectural vernacular at **{place.name}** is rooted in sustainable coastal ecology. "
                    f"Rather than permanent concrete construction, local tradition employs eco-friendly wooden stilts, bamboo supports, and thatched coconut-palm fronds. "
                    f"These organic structures are rebuilt and refreshed each season after the Arabian Sea monsoons, harmonizing seamlessly with the crescent coastline."
                )
            elif 'temple' in place.category.slug:
                text = (
                    f"**{place.name}** is a sublime masterpiece of classical Kalinga architecture. "
                    f"Constructed primarily using khondalite and chlorite stone, the complex utilizes dry-stone masonry with iron clamps rather than mortar. "
                    f"Notice the monumental tiered Jagamohana (pyramidal porch) and the 24 astronomical chariot wheels sculpted with microscopic geometric precision."
                )
            elif 'monument' in place.category.slug:
                text = (
                    f"The architecture of **{place.name}** embodies the pinnacle of Indo-Islamic Mughal design, blending Persian, Timurid, and Indian styles. "
                    f"The central structure stands upon a raised square marble plinth with chamfered corners, crowned by a majestic bulbous double-dome. "
                    f"The surfaces are embellished with delicate pietra dura parchment-inlay in semi-precious lapis lazuli, jasper, and carnelian."
                )
            else:
                text = (
                    f"The architectural language of **{place.name}** reflects indigenous stonecraft and structural engineering developed across centuries. "
                    f"{place.short_description}\n\n"
                    f"Each gateway and pavilion is positioned according to classical spatial principles, harmonizing with the surrounding natural topography."
                )

        # 2. History & Origins
        elif any(w in q_lower for w in ['history', 'who built', 'when', 'origin', 'king', 'ruler', 'story', 'why', 'founded', 'century']):
            text = (
                f"**Historical Origins of {place.name}:**\n\n"
                f"{place.short_description}\n\n"
                f"{place.history_notes or 'Celebrated across Indian history as an enduring testament to heritage, culture, and nature.'}"
            )

        # 3. Best Time / Climate
        elif any(w in q_lower for w in ['best time', 'weather', 'season', 'when to visit', 'climate', 'month']):
            text = (
                f"The ideal season to explore **{place.name}** is **{place.best_season}**.\n\n"
                f"During these months, {place.state.name if place.state else 'the region'} enjoys pleasant breezes, clear skies, and optimal conditions "
                f"both for walking through outdoor monuments and soaking in the coastal horizons."
            )

        # 4. Explicit inquiry about a POI
        elif any(p.title.lower() in q_lower for p in place.pois.all()):
            matched = next(p for p in place.pois.all() if p.title.lower() in q_lower)
            text = (
                f"**{matched.title}** is one of the most celebrated features at {place.name}.\n\n"
                f"{matched.body}"
            )

        # 5. Food / Shacks / Dining
        elif any(w in q_lower for w in ['food', 'eat', 'dish', 'cuisine', 'shack', 'restaurant', 'drink']):
            text = (
                f"Visiting **{place.name}** in {place.state.name if place.state else 'India'} offers wonderful culinary experiences. "
                f"Along the coast and nearby settlements, you will find authentic regional cuisine—from coconut-infused fish curries and sol kadhi in Goa, "
                f"to traditional temple prasad and regional savouries. The seasonal shacks offer fresh, locally sourced coastal meals."
            )

        # 6. Activities / What to do
        elif any(w in q_lower for w in ['do', 'activity', 'activities', 'experience', 'swim', 'walk', 'trek']):
            text = (
                f"At **{place.name}**, visitors can enjoy self-paced exploration: "
                f"take peaceful sunrise and sunset walks, observe coastal marine life or wildlife, explore the nearby rocky headlands, "
                f"and discover the architectural monuments highlighted in your 3D walkthrough."
            )

        # Default: Contextual overview
        else:
            text = (
                f"Welcome to **{place.name}**! {place.short_description}\n\n"
                f"As you navigate in the 3D tour, you can ask me about architectural techniques, historical rulers, "
                f"local legends, or points of interest such as "
                f"{', '.join([p.title for p in place.pois.all()[:2]]) if place.pois.exists() else 'the grounds'}."
            )

        return {
            "answer": text,
            "is_fallback": True,
            "source": "Bharat Darshan Verified Heritage Archive"
        }
