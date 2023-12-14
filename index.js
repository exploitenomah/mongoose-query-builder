


module.exports = class {
  constructor(Model, queryObj) {
    this.Model = Model
    this.queryObj = queryObj
    this.query = null
    this.page = null
    this.page = 1
    this.limit = 100
  }

  #filter() {
    const queryObj = { ...this.queryObj }
    const excludedFields = ["page", "sort", "limit", "fields"]
    excludedFields.forEach((el) => delete queryObj[el])
    let stringifiedQueryObj = JSON.stringify(queryObj)
    stringifiedQueryObj = stringifiedQueryObj.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    )
    this.query = this.Model.find(JSON.parse(stringifiedQueryObj))
    return this
  }

  #sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(",").join(" ")
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort("-createdAt")
    }
    return this
  }

  #limitFields() {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(",").join(" ")
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select("-__v")
    }
    return this
  }

  #paginate() {
    this.page = this.queryObj.page * 1 || this.page
    this.limit = this.queryObj.limit * 1 || this.limit
    const skip = (this.page - 1) * this.limit
    this.query = this.query.skip(skip).limit(this.limit)
    return this
  }

  async find() {
    return this.#filter().#sort().#limitFields().#paginate().query
  }
}
