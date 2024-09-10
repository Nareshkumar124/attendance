import {asyncHandler} from '../utils/handler';
import {Request,Response,NextFunction} from 'express';
import {Department,IDepartment} from '../models/department.model';
import {ApiResponse} from '../utils/ApiResponse';
import {ApiError} from '../utils/ApiError';
import {getDataFromCsvFile} from './common';


const createDepartment=asyncHandler(
    async function(req:Request,res:Response,next:NextFunction){

        const {name}=req.body;

        if(!name || name === ""){
            throw new ApiError(401,"Department name is required")
        }

        const department=await Department.create({
            name:name
        })

        res.status(200).json(
            new ApiResponse(
                200,
                department
            )
        )
    }
)

const getDepartment=asyncHandler(
    async function(req:Request,res:Response,next){
        const {id}=req.body;

        if(!id){
            throw new ApiError(
                400,"Department id is required"
            )
        }

        const department=await Department.findById(id);
 
        if(!department){  // Its working
            throw new ApiError(
                400,"Not able to found department"
            )
        }

        res.status(200).json(
            new ApiResponse(200,department)
        )
    }
)

const getAllDepartment=asyncHandler(
    async function(req:Request,res:Response,next){

        const AllDepartment=await Department.find({});
        res.status(200).json(
            new ApiResponse(200,AllDepartment)
        )

    }
)

const uploadDepartmentsUsingCsv=asyncHandler(
    async function (req:Request,res:Response,next:NextFunction){

        const jsonArray=await getDataFromCsvFile(req);

        const validatedJsonArray=[]

        for(const item of jsonArray){
            const department=new Department(item);

            await department.validate();

            validatedJsonArray.push(department)
        }

        await Department.insertMany(validatedJsonArray);

        res.status(200).json(
            new ApiResponse(200,jsonArray,"Data inserted successfully")
        )

    }
)

export {
    getDepartment,
    createDepartment,
    getAllDepartment,
    uploadDepartmentsUsingCsv,

}