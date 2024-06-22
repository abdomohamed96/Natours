
module.exports=class {
    constructor(query,queryStr) {
        this.query=query;
        this.queryStr=queryStr;
    }
    filter(){
        const queryObj={...this.queryStr}
        const excludedFields=['sort','limit','page','fields'];
        excludedFields.forEach((el)=>delete queryObj[el]);
        let queryStr=JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b(lte|lt|gt|gte)\b/g,match=>`$${match}`);

        this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort(){
        if(this.queryStr.sort){
            const sortBy=this.queryStr.sort.split(",").join(" ");
            this.query.sort(sortBy);
        }else
            this.query.sort("-createdAt name");
        return this
    }
    paginate(){
        let page = this.queryStr.page*1||1
        let numOfPages=this.queryStr.limit*1||5;
        let documentsToSkip=(page -1)*numOfPages
        this.query.skip(documentsToSkip).limit(numOfPages);
        return this;
    }
    limitFields(){
        if(this.queryStr.fields){
            let selectStr=this.queryStr.fields.split(",").join(" ");
            this.query.select(selectStr);
        }else
            this.query.select("-__v")
        return this;
    }
}