const fs = require('fs')
const path = require('path')
const ObjectId = require('mongodb').ObjectId
const { v4: uuidv4 } = require('uuid');
const {
    error_create_data,
    success_create_data,
    error_get_data,
    success_get_data,
    success_get_single_data,
    error_update_data,
    success_update_data,
    success_delete_data
} = require('./callback')

module.exports = class MyClass {
    constructor(DATA, Request, Response, Next) {
        this.model_schema = DATA
        this.req = Request
        this.res = Response
        this.next = Next
    }
    async createData() {
        const uid = { uuid: uuidv4() };
        const body = { ...this.req.body };
        const data = { ...uid, ...body, }
        const result = this.model_schema(data)
        result.save()
            .then(() => {
                return this.res.json({
                    message: success_create_data(),
                    data: result
                })
            })
            .catch((error) => {
                return this.res.json(error)
            })
    }
    async update_file(key, folder) {
        await this.model_schema.findById({ _id: this.req.params.id }).exec(async (error, data) => {
            if (error) {
                return this.res.json(error_get_data())
            } else {
                const files = data[key]
                let fileCount = 0
                for (let item of files) {
                    const filePath = path.join(__dirname, `../public/${folder}/` + item)
                    fs.unlink(filePath, function () { [] })
                    console.log("File is deleted", fileCount += 1)
                }

            }
        })
        await this.model_schema.findByIdAndUpdate({ _id: this.req.params.id }).exec(async (error, data) => {
            if (error) {
                return this.res.json(error_get_data())
            } else {

                const files = this.req.files
                const arrayFiles = []
                for (let item of files) {
                    const { filename } = item
                    arrayFiles.push(filename)
                }
                data[key] = arrayFiles
                data.save()
                    .then(() => {
                        return this.res.json(success_update_data(data))
                    })
                    .catch((error) => {
                        return this.res.json(error_update_data(error))
                    })
            }
        })
    }
    async update_content() {
        await this.model_schema.findByIdAndUpdate({ _id: this.req.params.id })
            .exec(async (error, data) => {
                if (error) throw error
                else {
                    Object.assign(data, this.req.body)
                    await data.save()
                        .then(() => {
                            this.res.json(data)
                        })
                        .catch((error) => {
                            this.res.json(error)
                        })
                }
            })
    }
    async delete_data_with_file(key, folder) {
        await this.model_schema.findById({ _id: this.req.params.id }).exec(async (error, data) => {
            if (error) {
                return this.res.json(error_get_data())
            } else {
                const files = data[key]
                let fileCount = 0
                for (let item of files) {
                    const filePath = path.join(__dirname, `../public/${folder}/` + item)
                    fs.unlink(filePath, function () { [] })
                    console.log("File is deleted", fileCount += 1)
                }
                await this.model_schema.findByIdAndDelete({ _id: this.req.params.id })
                this.res.json(success_delete_data())

            }
        })
    }
    async delete_data_without_file() {
        await this.model_schema.findByIdAndDelete({ _id: this.req.params.id })
            .exec(async (error, data) => {
                if (error) {
                    return this.res.json(error_get_data())
                } else {
                    return this.res.json(success_delete_data())
                }
            })
    }
    async get_one(...populate) {
        await this.model_schema
            .findById({ _id: this.req.params.id })
            .populate([...populate])
            .exec((error, data) => {
                if (error) {
                    return this.res.json(error_get_data())
                } else {
                    return this.res.json(success_get_single_data(data))
                }
            })
    }
    async get_all(...populate) {
        await this.model_schema
            .find({
                actions: {
                    $eq: this.req.query.actions
                }
            })
            .populate([...populate])
            .sort({ createdAt: -1 })
            .lean()
            .exec((error, data) => {
                if (error) {
                    return this.res.json(error_get_data())
                } else {
                    return this.res.json(success_get_data(data))
                }
            })
    }
    async get_all_pagionation(...populate) {
        const count = 10
        const skip = parseInt((this.req.query.pages - 1) * count)

        if (!skip || skip == "" || skip == undefined || skip == 1) {
            await this.model_schema
                .find()
                .populate([...populate])
                .sort({ createdAt: -1 })
                .limit(count)
                .exec((error, data) => {
                    if (error) {
                        return this.res.json(error_get_data())
                    } else {
                        return this.res.json(success_get_data(data))
                    }
                })
        }
        else if (skip >= 2) {
            await this.model_schema.find()
                .sort({ createdAt: -1 })
                .populate([...populate])
                .limit(count)
                .skip(skip)
                .exec((error, data) => {
                    if (error) {
                        return this.res.json(error_get_data())
                    } else {
                        return this.res.json(success_get_data(data))
                    }
                })
        }
    }
    async filterById(item) {
        await this.model_schema.aggregate([
            {
                $match: {
                    [item]: ObjectId(this.req.params.id)
                }
            }
        ]).exec((error, data) => {
            if (error) {
                return this.res.json(error_get_data())
            } else {
                return this.res.json(success_get_data(data))
            }
        });
    }
    async get_by_role(...populate) {
        const { role, actions } = this.req.query
        if (role == "" || !role || actions == "" || !actions) {
            return this.res.json(error_get_data())
        } else {
            await this.model_schema
                .find({
                    $and: [
                        { actions: { $eq: actions } },
                        { role: { $eq: role } }
                    ]
                })
                .sort({ createdAt: -1 })
                .populate([...populate])
                .lean()
                .exec((error, data) => {
                    if (error) {
                        return this.res.json(error_get_data())
                    } else {
                        return this.res.json(success_get_data(data))
                    }
                });
        }
    }
}