"use client";
import { Alert, Button } from "antd";
import { useFormik } from "formik";
import { unstable_rethrow } from "next/navigation";
import * as yup from "yup";
import { useEffect, useRef, useState } from "react";

type Props={action:(formData:FormData)=>void|Promise<void>;children:React.ReactNode;required?:string[];email?:string[];submitLabel?:string;className?:string;encType?:string};
export function ValidatedAdminForm({action,children,required=[],email=[],submitLabel="Guardar",className="admin-form",encType}:Props){
  const formRef=useRef<HTMLFormElement>(null); const [message,setMessage]=useState("");
  useEffect(()=>{const form=formRef.current;if(!form)return;required.forEach(name=>{const field=form.elements.namedItem(name);if(field instanceof HTMLInputElement||field instanceof HTMLTextAreaElement||field instanceof HTMLSelectElement)field.required=true;});email.forEach(name=>{const field=form.elements.namedItem(name);if(field instanceof HTMLInputElement)field.type="email";});},[required,email]);
  const formik=useFormik<Record<string,string>>({initialValues:{},onSubmit:async()=>{const form=formRef.current;if(!form)return;const values=Object.fromEntries(new FormData(form).entries());const shape:Record<string,yup.StringSchema>={};required.forEach(name=>shape[name]=yup.string().trim().required("Este campo es obligatorio"));email.forEach(name=>shape[name]=yup.string().trim().email("Ingresa un correo válido").required("Este campo es obligatorio"));try{await yup.object(shape).validate(values,{abortEarly:false});setMessage("");await action(new FormData(form));}catch(error){unstable_rethrow(error);if(error instanceof yup.ValidationError){const errors=Object.fromEntries(error.inner.map(item=>[item.path??"form",item.message]));formik.setErrors(errors);form.dispatchEvent(new CustomEvent("form:errors",{bubbles:true,detail:{errors}}));setMessage("Revisa los campos marcados antes de guardar.");return;}setMessage(error instanceof Error?error.message:"No se pudo guardar. Revisa los datos e inténtalo nuevamente.");}}});
  return <form ref={formRef} className={`${className} validated-admin-form`} encType={encType} onSubmit={formik.handleSubmit} noValidate>{message&&<Alert type="error" showIcon message={message}/>}<div className="admin-form-fields">{children}</div><Button type="primary" htmlType="submit">{submitLabel}</Button></form>;
}
