<script setup lang="ts">

import InputArea from './InputArea.vue';
import Comment from './Comment.vue';
import { onMounted, ref } from 'vue';
import axios from 'axios';

interface DBCommentData {
    id: number,
    parent_id: number | null,
    content: string,
    is_author: number,
    created_at: string,
    updated_at: string,
};

interface ApiCommentGetResponse {
    success: boolean,
    results: DBCommentData[],
}

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

/* Javascript variables */
const commentsUrl = 'https://anonymous-comment.lygreen7412.workers.dev/comments';

/* Vue variables */
const comments = ref<Comment[]>([]);

/* Functions */
function transformData(data: DBCommentData[]) {
    const commentMap: Record<number, Comment> = {};
    const comments: Comment[] = [];

    data.forEach(item => {
        commentMap[item.id] = {
            main: {
                id: item.id,
                parentId: item.parent_id,
                content: item.content,
                isAuthor: item.is_author === 1,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            },
            children: [],
        }
    });

    data.forEach(item => {
        if (item.parent_id === null) {
            comments.push(commentMap[item.id]);
        } else {
            if (commentMap[item.parent_id]) {
                commentMap[item.parent_id].children.push({
                    id: item.id,
                    parentId: item.parent_id,
                    content: item.content,
                    isAuthor: item.is_author === 1,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at,
                });
            }
        }
    });

    return comments;
}

onMounted(() => {
    axios.get<ApiCommentGetResponse>(commentsUrl)
        .then((response) => {
            comments.value = transformData(response.data.results);
        });

});

/* Events */
function onSend(comment: Comment) {
    comments.value.unshift(comment);
}

</script>

<template>
    <div id="comment-layout">
        <InputArea @send="onSend" />
        <!-- <Comment /> -->
        <template v-if="comments.length !== 0">
            <Comment v-for="item in comments" :key="item.id" :comment="item" />
        </template>
        <template v-else>
            <span class="no-comments-msg">No comments yet.</span>
        </template>
    </div>
</template>

<style scoped>

#comment-layout {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 12px;
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.no-comments-msg {
    color: #888;
    font-size: 16px;
    text-align: center;
    margin-top: 16px;
}

</style>
