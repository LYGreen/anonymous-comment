<script setup lang="ts">

import { ref, emit, computed } from 'vue';
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

const emit = defineEmits<{
    (e: 'send', comment: Comment): void
}>();

/* Javascript variables */
const commentsUrl = 'https://anonymous-comment.lygreen7412.workers.dev/comments';
const BaseUrl = (import.meta as any).env.BASE_URL || '';

/* Vue variables */
const { authorKey } = storeToRefs(useAuthorKeyStore());
const inputContent = ref<string>('');
const sending = ref<boolean>(false);
const computeDisabled = computed(() => {
    return !inputContent.value || sending.value;
});

/* Events */
function onButtonClick() {
    sending.value = true;

    axios.post<ApiCommentPostResponse>(commentsUrl, {
        parent_id: null,
        content: inputContent.value,
        author_key: authorKey.value,
    }, {
        timeout: 30 * 1000,
    }).then((response) => {
        if (response.data.success) {
            const inserted = response.data.results[0];
            emit('send', {
                main: {
                    id: inserted.id,
                    parentId: inserted.parent_id,
                    content: inserted.content,
                    isAuthor: inserted.is_author === 1,
                    createdAt: inserted.created_at,
                    updatedAt: inserted.updated_at,
                },
                children: [],
            });
            inputContent.value = '';
        }
    }).catch((error) => {
        console.log(error);
    }).finally(() => {
        sending.value = false;
    });
}

</script>

<template>
    <div id="input-area">
        <h2>Anonymous Comment</h2>
        <textarea v-model="inputContent" rows="8" cols="50" placeholder="Write your comment here..."></textarea>
        <button @click="onButtonClick" :disabled="computeDisabled">Send</button>
    </div>
</template>

<style scoped>

textarea {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
    font-family: inherit;
}

button {
    margin-top: 8px;
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

#sidebar {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

</style>
