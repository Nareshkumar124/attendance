import mongoose,{Schema} from 'mongoose';

interface ITest extends mongoose.Document {
    auid:string
    name: string
    email:String
    macAddress:String,
    time:String,
    teacherId:String,
    courseId:String,
    date:string
}

const testSchema:Schema=new Schema({
    auid:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },

    macAddress:{
        type:String,
        required:true,
    },
    time:{
        type:String,
        required:true,
    },
    teacherId:{
        type:String,
        required:true,
    }, 
    subjectId:{
        type:String,
        required:true,
    }, 
    date:{
        type:String,
        required:true,
    }, 
},{
    timestamps:true
}) 

const Test= mongoose.model<ITest>("test",testSchema);

export{
    Test,ITest
}