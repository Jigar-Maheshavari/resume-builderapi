
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Types = Schema.Types

const userModerationSchema = () => {
    return new Schema(
        {
            user: {
                type: Types.ObjectId,
                ref: 'user',
                require: true
            },
            moderationModel: {
                type: Types.ObjectId,
                ref: 'moderation-model',
                require: true
            },
            moderationModelInvoke: {
                type: Types.ObjectId,
                ref: 'moderation-model-invoke',
                require: true
            },
            stressModel: {
                type: Types.ObjectId,
                ref: 'stress',
                default: null
            },
            type: {
                type: Types.String, // model type text, image, video
                require: true
            },
            requestPayloadName: {
                type: Types.String,
                default: null
            },
            invokeAt: {
                type: Types.Date,
                default: null
            },
            price: {
                type: Types.Mixed,
                default: null
            },
            ip: {
                type: Types.ObjectId,
                ref: 'ipdata',
                default: null
            },
            createdAt: {
                type: Types.Date,
                default: null
            },
            updatedAt: {
                type: Types.Date,
                default: null
            }
        },
        {
            versionKey: false,
            strict: false,
            timestamps: true
        }
    )
}

const userModerationModelName = (user) => {
    return `z-user-moderation-${user}-invoke`;
}

const getUserModerationModel = (user) => {
    const aiDBConn = require('@plugins/mongoose.plugin').plugin.aiDBConn();
    const userInvokeModelName = userModerationModelName(user);
    if (!aiDBConn.models[userInvokeModelName]) {
        aiDBConn.model(userInvokeModelName, userModerationSchema());
    }
    return aiDBConn.models[userInvokeModelName]
}

module.exports = {
    userModerationSchema,
    userModerationModelName,
    getUserModerationModel
}