import { reactive, ref } from "vue";
import { defineStore } from "pinia";

export const useProfileStore = defineStore("profile", () => {
    const profile = reactive({
        login: '',
        id: 0,
        avatar_url: '',
        html_url: '',
        name: '',
        bio: '',
        followers: 0,
        following: 0,
        created_at: '',
        updated_at: '',
    });

    return {
        profile,
    };
});
