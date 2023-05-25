/* @nest.js */
import { Schema } from "mongoose";

export type UserIdRelation = { type: Schema.Types.ObjectId, ref: 'users' };