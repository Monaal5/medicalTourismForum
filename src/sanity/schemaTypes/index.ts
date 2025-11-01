import { type SchemaTypeDefinition } from 'sanity'
import { userType } from './userType'
import { postType } from './postType'
import { subredditType } from './subredditTypes'
import { commentType } from './commentType'   
import { voteType } from './voteType'
import { questionType } from './questionType'
import { answerType } from './answerType'
import { categoryType } from './categoryType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    userType,
    subredditType,
    postType,
    commentType,
    voteType,
    questionType,
    answerType,
    categoryType,
  ],
}
