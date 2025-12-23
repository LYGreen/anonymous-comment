import { ref } from "vue";
import { defineStore } from "pinia";

export const useAuthorKeyStore = defineStore("author-key", () => {
    const authorKey = ref("");

    return {
        authorKey,
    };
});
