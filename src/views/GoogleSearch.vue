<template>
  <div class="search_container">
    <Icon icon="streamline-freehand:worldwide-web-sync" width="30" height="30"  style="color: #000" />
    <h1>Google Search Extractor</h1>

    <div class="search_controls">
      <input
        v-model="query"
        @keyup.enter="getSearchResults"
        placeholder="Zadejte hledaný výraz"
      />
    </div>

    <div class="search_buttons">
      <button class="search_btn" @click="getSearchResults" :disabled="loading">
        Hledat
      </button>

      <button class="save_btn" @click="saveResults" :disabled="!results.length">
        Uložit do JSON
      </button>
    </div>

    <div v-if="loading">Načítám…</div>
    <div v-if="error" class="error">{{ error }}</div>

    <ul v-if="results.length" class="results_list">
      <li v-for="(item, index) in results" :key="index">
        <a :href="item.link" target="_blank">{{ item.title }}</a>
        <p>{{ item.snippet }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "GoogleSearch",

  components: {
    Icon,
  },

  data() {
    return {
      query: "",
      results: [],
      loading: false,
      error: "",
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      searchEngineId: import.meta.env.VITE_CX_ID,
    };
  },
  mounted() {
    const cx = this.searchEngineId;
    const scriptId = "gcse-script-" + cx;

    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.async = true;
      s.src = `https://cse.google.com/cse.js?cx=${cx}`;
      document.body.appendChild(s);
    } else {
      if (window.google && window.google.search && window.google.search.cse) {
        window.google.search.cse.element.render({
          div: "gcse-search",
          tag: "search",
        });
      }
    }
  },
  methods: {
    async getSearchResults() {
      if (!this.query.trim()) return;

      this.loading = true;
      this.error = "";
      this.results = [];

      try {
        const url = new URL("https://www.googleapis.com/customsearch/v1");
        url.searchParams.set("key", this.apiKey);
        url.searchParams.set("cx", this.searchEngineId);
        url.searchParams.set("q", this.query);
        url.searchParams.set("num", "10");

        const response = await fetch(url);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        this.results = (data.items || []).map((item) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        }));
      } catch (e) {
        console.error(e);
        this.error =
          "Nepodařilo se načíst výsledky. Zkontroluj API klíč a kvóty.";
      } finally {
        this.loading = false;
      }
    },

    saveResults() {
      if (!this.results.length) return;
      const content = JSON.stringify(this.results, null, 2);
      const blob = new Blob([content], {
        type: "application/json;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "search-results.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Heebo:wght@100..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap");

.search_container {
  max-width: 850px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search_container h1 {
  font-size: 28px;
  color: #24292d;
  margin: 20px 0 15px;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  font-family: "Heebo", sans-serif;
}

.search_controls {
  width: 100%;
  display: flex;
}

.search_controls input {
  margin: 0 50px;
  flex: 1;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  font-family: "Nunito Sans", sans-serif;
  background: #ffffff;
  color: #1e293b;
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

input:focus {
  outline: none;
  border-color: #41414170;
  transition: border-color 0.3s ease;
}

.search_buttons {
  margin-bottom: 1rem;
}

button {
  font-family: "Nunito sans", sans-serif;
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
}

.submit-button {
  margin-top: 30px;
  width: 180px;
  padding: 12px 0;
  background: linear-gradient(135deg, #88b3c8, #649ecd);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.search_btn {
  color: #ffffff;
  margin-top: 30px;
  width: 100px;
  padding: 12px 0;
  background: linear-gradient(135deg, #c0c0c0, #808080);
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.search_btn:hover {
  background: linear-gradient(135deg, #e0e0e0, #a0a0a0);
}

.save_btn {
  color: white;
  margin-top: 30px;
  width: 180px;
  padding: 12px 0;
  background: linear-gradient(135deg, #88b3c8, #649ecd);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.save_btn:hover {
  background: linear-gradient(135deg, #a0cfe0, #7dabec);
}

.error {
  font-family: "Nunito sans", sans-serif;
  color: red;
  margin-top: 1rem;
}

.results_list {
  list-style: none;
  padding: 0 10px;
}

.results_list li {
  margin: 1rem 0;
}

.results_list a {
  font-weight: bold;
  text-decoration: none;
  font-family: "Nunito sans", sans-serif;
  font-size: 18px;
  color: #1f73e9;
}

.results_list p {
  font-family: "Nunito sans", sans-serif;
  font-size: 16px;
  color: #334155;
  margin-bottom: 40px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  margin: 0.25rem 0 0;
}

@media screen and (max-width: 480px) {
  .search_controls input {
    margin: 0 10px;
  }
}

</style>
