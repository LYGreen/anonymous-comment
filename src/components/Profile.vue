<script setup lang="ts">

import axios from 'axios';
import { storeToRefs } from 'pinia';
import { reactive, onMounted, ref } from 'vue';
import { useAuthorKeyStore } from '../stores/author-key';
import { useProfileStore } from '../stores/profile';

interface UserProfile {
    login: string,
    id: number,
    avatar_url: string,
    html_url: string,
    name: string,
    bio: string,
    followers: number,
    following: number,
    created_at: string,
    updated_at: string,
}

/* Javascript variables */
const ProfileApiUrl = 'https://api.github.com/users/LYGreen';
const KeyValidationUrl = 'https://anonymous-comment.lygreen7412.workers.dev/key';
const RepositoryUrl = 'https://github.com/LYGreen/anonymous-comment';
const BaseUrl = (import.meta as any).env.BASE_URL || '';
const statusIcons = {
    empty: `${BaseUrl}/help-circle.svg`,
    valid: `${BaseUrl}/check.svg`,
    invalid: `${BaseUrl}/x.svg`,
    waiting: `${BaseUrl}/refresh-cw.svg`,
};
let controller: AbortController | null = null;

/* Vue variables */
const { profile } = useProfileStore();
const { authorKey } = storeToRefs<{ authorKey: string }>(useAuthorKeyStore());
const statusSrc = ref<string>(statusIcons.empty);

/* Initialization */
function preload() {
    Object.entries(statusIcons).forEach(([key, src]) => {
        const img = new Image();
        img.src = src;
    });
}

function requestProfile() {
    axios.get(ProfileApiUrl)
        .then(response => {
            Object.assign(profile, response.data);
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
        });
}

onMounted(() => {
    preload();
    requestProfile();
});

/* Events */
function onAuthorKeyChange(event: Event) {
    const key = authorKey.value.trim();
    if (controller) {
        controller.abort();
    }
    controller = new AbortController();

    if (key === '') {
        statusSrc.value = statusIcons.empty;
        return;
    }

    statusSrc.value = statusIcons.waiting;

    axios.post(KeyValidationUrl, {
        author_key: key,
    }, {
        signal: controller.signal,
        timeout: 30 * 1000,
    }).then(response => {
        if (response.data.success) {
            statusSrc.value = statusIcons.valid;
        } else {
            statusSrc.value = statusIcons.invalid;
        }
    }).catch(error => {
        if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
        } else {
            console.error('Error validating author key:', error);
            statusSrc.value = statusIcons.invalid;
        }
    });
}

</script>

<template>
    <div id="profile">
        <img :src="profile.avatar_url" alt="avatar" class="avatar">
        <h2 class="name">{{ profile.name }}</h2>
        <p class="login">{{ profile.login }}</p>
        <p>{{ profile.bio }}</p>
        <span class="middle">{{ profile.followers }} followers · {{ profile.following }} following</span>
        <span class="small">Created at: {{ profile.created_at }}</span>
        <span class="small">Updated at: {{ profile.updated_at }}</span>
        <div class="author-key-area">
            <label for="author-key">Author Key</label>
            <img :src="statusSrc" alt="" :class="{ 'status-icon': true, 'rotate': statusSrc === statusIcons.waiting }">
            <input v-model="authorKey" id="author-key" type="text" @change="onAuthorKeyChange" autocomplete="off" placeholder="Author key">
        </div>
        <a :href="RepositoryUrl" class="feedback" target="_blank">Feedback on this page</a>
    </div>
</template>

<style scoped>

input[type="text"] {
    width: 100%;
    padding: 4px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
    margin-top: 4px;
}

h2 {
    margin-bottom: 0;
}

p {
    max-width: 28ch;
    margin-top: 0;
}

.rotate {
    animation: anim-rotate 2s linear infinite;
}

.middle {
    margin: 0.1rem;
    font-size: 16px;
}

.small {
    margin: 0.1rem;
    font-size: 12px;
    color: gray;
}

.avatar {
    border-radius: 100%;
    width: 100px;
    height: 100px;
}

.login {
    color: rgb(76, 76, 76);
}

.feedback {
    margin-top: auto;
    font-size: 12px;
    color: #555;
    text-decoration: underline;
    align-self: flex-start;
}

.author-key-area {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 12px;

    .status-icon {
        width: 24px;
        height: 24px;
        border-radius: 100%;
        margin: 0 8px;
        align-self: center;
    }
}

#profile {
    position: sticky;
    top: 0;
    background-color: #fdfdfd;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 16px;
    height: 100vh;
    flex: 1;
    display: flex;
    flex-direction: column;  
}

@keyframes anim-rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    #profile {
        position: inherit;
    }

    .feedback {
        margin-top: 12px;
    }
}

</style>
