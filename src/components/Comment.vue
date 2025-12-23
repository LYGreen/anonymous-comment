<script setup lang="ts">

import { computed, ref } from 'vue';
import { useProfileStore } from '../stores/profile'
import { useAuthorKeyStore } from '../stores/author-key';
import axios from 'axios';
import { storeToRefs } from 'pinia';

interface DBCommentData {
    id: number,
    parent_id: number | null,
    content: string,
    is_author: number,
    created_at: string,
    updated_at: string,
};

interface CommentData {
    id: number,
    parentId: number | null,
    content: string,
    isAuthor: boolean,
    createdAt: string,
    updatedAt: string,
}

interface Comment {
    main: CommentData,
    children: CommentData[],
}

interface ApiCommentPostResponse {
    success: boolean,
    results: DBCommentData,
}

const props = defineProps<{
    comment: Comment
}>();

/* Functions */
const getCommentAvatarUrl = (isAuthor: boolean) => {
    return isAuthor ? profile.avatar_url : BaseUrl + '/vue.svg';
};

const getCommentName = (isAuthor: boolean) => {
    return isAuthor ? profile.name : 'Anonymous';
};

const dateStringToLocaleTimeString = (dateString: string) => {
    return new Date(dateString.replace(' ', 'T') + 'Z').toLocaleString();
};

/* Javascript variables */
const commentsUrl = 'https://anonymous-comment.lygreen7412.workers.dev/comments';
const BaseUrl = (import.meta as any).env.BASE_URL || '';

/* Vue variables */
const { authorKey } = storeToRefs(useAuthorKeyStore());
const { profile } = useProfileStore();
const inputContent = ref<string>('');
const sending = ref<boolean>(false);
const computeDisabled = computed(() => {
    return !inputContent.value || sending.value;
});

/* Events */
function onButtonClick() {
    sending.value = true;
    axios.post<ApiCommentPostResponse>(commentsUrl, {
        parent_id: props.comment.main.id,
        content: inputContent.value,
        author_key: authorKey.value,
    }, {
        timeout: 30 * 1000,
    }).then((response) => {
        if (response.data.success) {
            const inserted: DBCommentData = response.data.results[0];
            props.comment.children.push({
                id: inserted.id,
                parentId: inserted.parent_id,
                content: inserted.content,
                isAuthor: inserted.is_author === 1,
                createdAt: inserted.created_at,
                updatedAt: inserted.updated_at,
            });
            inputContent.value = '';
        }
    }).catch((error) => {
        console.error('Error posting comment:', error);
    }).finally(() => {
        sending.value = false;
    });
}

</script>

<template>
    <div id="comment">
        <div class="body main-comment">
            <img :src="getCommentAvatarUrl(comment.main.isAuthor)" alt="avatar">
            <div class="info">
                <div class="meta">
                    <h3>{{ getCommentName(comment.main.isAuthor) }}&nbsp;-&nbsp;</h3>
                    <span>{{ dateStringToLocaleTimeString(comment.main.createdAt) }}</span>
                    
                </div>
                <p class="content">{{ comment.main.content }}</p>
            </div>
        </div>
        <div class="body children-comment" v-for="child in comment.children" :key="child.id">
            <img :src="getCommentAvatarUrl(child.isAuthor)" alt="avatar">
            <div class="info">
                <div class="meta">
                    <h3>{{ getCommentName(child.isAuthor) }}&nbsp;-&nbsp;</h3>
                    <span>{{ dateStringToLocaleTimeString(child.createdAt) }}</span>
                </div>
                <p class="content">{{ child.content }}</p>
            </div>
        </div>
        <div class="footer">
            <textarea v-model="inputContent" name="content" rows="1" cols="1" :key="comment.main.id"></textarea>
            <button @click="onButtonClick" :disabled="computeDisabled">Send</button>
        </div>
    </div>
</template>

<style scoped>

p {
    margin: 0;
    overflow-wrap: anywhere;
    font-size: 16px;
}

span {
    color: #888;
    font-size: 14px;
}

h3 {
    margin: 0;
    font-size: 16px;
}

textarea {
    border: 2px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    flex: 1;
    padding: 4px 8px;
    resize: none;
    overflow: hidden;
    font-family: inherit;
}

button {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #369870;
    }

    &[disabled], &[disabled]:hover {
        background-color: #ccc;
        cursor: not-allowed;
    }
}

img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin: 8px 0;
    border: 1px solid #eee;
}

#comment {
    border: 2px solid #eee;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    &:hover .footer {
        height: 32px;
    }
}

.body {
    display: flex;
    flex-direction: row;
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    gap: 12px;

    .info {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        gap: 4px;
        min-width: 0;
        max-width: 100%;

        .meta {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 4px;
        }
    }
}

.footer {
    display: flex;
    flex-direction: row;
    gap: 12px;
    height: 0px;
    overflow: hidden;
    transition: height 0.3s ease;

    &:has(textarea:focus), &:hover {
        height: 32px;
    }
}

</style>
