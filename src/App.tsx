import { useState } from "react";
import { useForm, FieldValues, useFieldArray } from "react-hook-form";
import { useQuery } from "react-query";

import { BsThreeDotsVertical, BsFillFileEarmarkArrowDownFill, BsFillTrashFill } from "react-icons/bs";
import {
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
} from "react-icons/md";
// import { HiOutlineEmojiSad } from 'react-icons/hi';

import imageCompression from 'browser-image-compression';

import Modal from "./components/Modal";
import { toastAlert } from "./components/Alert";
import useDebounce from "./hooks/useDebounce";
import api from "./services/api";

import { motion } from "framer-motion";

import sawIcon from "./assets/icons/saw.png";

export default function App() {
  const [page, setPage] = useState(1);
  const [image, setImage] = useState('');
  const [search, setSearch] = useState('');
  const [loader, setLoader] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const { handleSubmit, register, formState, control, reset } = useForm();
  const { errors } = formState;

  const { fields, replace, remove } = useFieldArray({
    control,
    name: "draws"
  });

  const delayedSearch = useDebounce(search, 500);

  const handleNextPageClick = () => {
    setPage((lastPage: number) => ++lastPage);
  };

  const handlePrevPageClick = () => {
    setPage((lastPage: number) => --lastPage);
  };

  const fetchDraws = async () => {
    try {
      const { 
        data: { 
          draws: { hasNextPage, docs }
        } 
      } = await api.get(`/draws/${page}`, {
        params: {
          search: delayedSearch ? delayedSearch : '',
          limit: 20
        }
      });

      setHasNextPage(hasNextPage)
      replace(docs);
    } catch (err: any) {
      console.log(err);
    }
  };

  const imageCompressor = async (file: File) => {  
    if(file.type.startsWith("image")) {
      setLoader(true);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }
  
      try {
        const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();
          reader.onload = async function () {
            if (typeof reader.result === "string") {
              setLoader(false);
              setImage(reader.result);
            }

            return "";
          };

          reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.log(err);
      } finally {
        setLoader(false);
      }
    } else {
      toastAlert({ icon: "error", title: "Apenas imagens são aceitas", timer: 3000 });
    }
  };

  const handleAddNewDraw = async (formData: FieldValues) => {
    const { type, clientName, clientAddress } = formData;
    setLoader(true);

    try {
      const { data: { message } } = await api.post("/add", {
        type,
        client: {
          name: clientName,
          address: clientAddress
        },
        image
      });

      fetchDraws();
      toastAlert({ icon: "success", title: message, timer: 2000 });
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    } finally {
      setLoader(false)
    }
  };

  const handleDelete = async (id: string, index: number) => {
    setLoader(true);

    try {
      const { data: { message } } = await api.delete(`/delete/${id}`);

      remove(index);
      toastAlert({ icon: "success", title: message, timer: 2000 });
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    } finally {
      setLoader(false)
    }
  };

  const handleCloseModal = () => {
    reset({
      type: "",
      clientName: "",
      clientAddress: ""
    });
    setOpenEditModal(false);
  }

  const donwloadImage = (srcLink: string, cardId: string) => {
    const a = Object.assign(document.createElement("a"), { 
      href: srcLink, 
      style:"display:none", 
      download: `image_${cardId}`
    });
    
    document.body.appendChild(a);

    a.click();
    a.remove();
  };
  
  const { isFetching } = useQuery(
    ["fetchDraws", delayedSearch, page], fetchDraws,
    { refetchInterval: 300000, refetchOnWindowFocus: false }
  );

  return (
    <div className="text-black">
      <Modal
        open={openEditModal}
        setOpen={setOpenEditModal}
        title="Adicionar novo desenho"
        options={{
          titleWrapperClassName: "!px-6",
          modalWrapperClassName: "overflow-hidden max-h-[30rem] px-0 w-[27rem] xxs:!w-[22.5rem]",
          onClose: handleCloseModal
        }}
      >
        <div className="px-6 h-[25rem] overflow-auto overflow-y-scroll">
          <form noValidate onSubmit={handleSubmit(handleAddNewDraw)} className="mt-5 mb-6">
            <div className="flex flex-col space-y-3">
              {errors.type?.message ? (
                <p className="text-red-500 ml-1 uppercase text-xs tracking-widest">
                  {errors.type?.message as string}
                </p>
              ) : <p>Tipo do móvel</p>}
              <input 
                type="text" 
                placeholder="Escreva aqui"
                className="input input-bordered border-gray-600 w-full max-w-xs bg-gray-200"
                {...register("type", { required: "O tipo é obrigatório!" })}
              />
              {errors.clientName?.message ? (
                <p className="text-red-500 ml-1 uppercase text-xs tracking-widest">
                  {errors.type?.message as string}
                </p>
              ) : <p>Nome do cliente</p>}
              <input 
                type="text" 
                placeholder="Escreva aqui"
                className="input input-bordered border-gray-600 w-full max-w-xs bg-gray-200"
                {...register("clientName", { required: "O nome do cliente é obrigatório!" })}
              />
              {errors.clientAddress?.message ? (
                <p className="text-red-500 ml-1 uppercase text-xs tracking-widest">
                  {errors.type?.message as string}
                </p>
              ) : <p>Endereço do cliente</p>}
              <input
                type="text"
                placeholder="Escreva aqui"
                className="input input-bordered border-gray-600 w-full max-w-xs bg-gray-200"
                {...register("clientAddress", { required: "O endereço do cliente é obrigatório!" })}
              />
              <p>Adicionar desenho</p>
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered border-gray-600 w-full max-w-xs bg-gray-200 file:bg-gray-600 file:border-transparent file:text-white"
                onChange={(e) => imageCompressor((e.target.files as FileList)[0])}
              />
              <button 
                className="!mt-6 text-white rounded-full bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out px-2 py-2 text-[15px] uppercase tracking-wide w-full disabled:opacity-50 disabled:hover:bg-green-600 disabled:cursor-not-allowed"
                disabled={(!image || loader) && true}
              >
                {loader ? (
                  <p className="animate-pulse text-gray-300">Carregando...</p>
                ) : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <nav className="flex justify-between md:px-20 xxs:px-4 sm:px-4 py-5 items-center border border-transparent border-b-gray-900">
        <div className="flex flex-row space-x-3">
          <img
            src={sawIcon}
            alt="Saw icon"
            className="w-10 h-10"
            draggable={false}
          />
          <h1
            className="text-xl xxs:text-lg text-black pt-2"
            style={{ fontFamily: "Cut-Deep" }}
          >
            Caio moveis
          </h1>
        </div>
        <button 
          className="font-thin px-4 py-2 hover:bg-gray-200/60 transition-colors duration-300 ease-in-out text-black tracking-wide rounded-full border border-gray-600 uppercase text-sm xxs:text-xs"
          onClick={() => setOpenEditModal(true)}
        >
          <div className="flex flex-row space-x-3">
            <p>novo desenho</p>
          </div>
        </button>
      </nav>
      <div className="mt-24 xxs:mt-10 mb-10 mx-auto">
        <div className="flex flex-col justify-center items-center">
          <p
            className="uppercase text-[15px] tracking-widest"
            style={{
              fontFamily: "Roboto",
            }}
          >
            Desenhos
          </p>
          <div className="mx-auto mt-5">
            <div className="relative flex items-center w-[24rem] xxs:w-[20rem] h-12 rounded-lg focus-within:shadow-lg overflow-hidden border border-gray-600">
              <div className="grid place-items-center h-full w-12 text-gray-600 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                className="peer h-full w-full outline-none text-sm text-gray-900 pr-2 bg-inherit"
                type="text"
                id="search"
                placeholder="Buscar desenhos..."
                onChange={({currentTarget}) => setSearch(currentTarget.value)}
              />
            </div>
          </div>
          <div className="mt-9 bg-[#eaeaea] text-gray-900">
            <div className="btn-group bg-[#f8f8f8] flex !justify-between">
              {page === 1 ? (
                <button className="btn !border-transparent !bg-inherit text-gray-500 cursor-not-allowed">
                  <MdKeyboardDoubleArrowLeft
                    size={18}
                    className="cursor-not-allowed"
                  />
                </button>
              ) : (
                <button
                  className="btn bg-[#f8f8f8] hover:!bg-[#f8f8f8] !border-transparent text-lg"
                  onClick={() => handlePrevPageClick()}
                >
                  <MdKeyboardDoubleArrowLeft className="text-gray-900" />
                </button>
              )}
              <p className="bg-[#f8f8f8] text-gray-900 uppercase tracking-widest text-sm cursor-default my-auto px-10">
                Page {page}
              </p>
              {!hasNextPage ? (
                <button className="btn !border-transparent !bg-inherit text-gray-500 cursor-not-allowed">
                  <MdKeyboardDoubleArrowRight
                    className="cursor-not-allowed"
                    size={18}
                  />
                </button>
              ) : (
                <button
                  className="btn bg-[#f8f8f8] hover:!bg-[#f8f8f8] !border-transparent text-lg "
                  onClick={() => handleNextPageClick()}
                >
                  <MdKeyboardDoubleArrowRight className="text-gray-900" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-10 justify-center items-center mt-10">
          {(fields.length > 0 && !isFetching) ? (
            <>
              {fields.map((draw: any, index: number) => {
                return (
                  <div 
                    className={`
                      max-w-sm xxs:w-[20rem] overflow-hidden rounded-xl border border-gray-400
                      ${index === (fields.length - 1) && "!mb-20"}
                    `}
                    key={draw._id}
                  >
                    <div 
                      className="!relative"
                      onMouseEnter={() => setHover(index)} 
                      onMouseLeave={() => setHover(null)}
                    >
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.3  }}
                        className={`cursor-pointer !absolute right-0 !w-8 bg-[#ffffff] dark:bg-[#181818] text-gray-900 dark:text-gray-300 rounded-bl-lg rounded-tr-lg h-8 hidden ${hover === index && '!inline'}`}
                      >
                        <div className="flex flex-row space-x-2 px-2 pt-1 justify-between">  
                          <div className="dropdown dropdown-left">
                            <label 
                              tabIndex={0}
                              className={`text-[11px] uppercase tracking-widest cursor-pointer`}
                            >
                              <div className="rounded-full py-1 pl-[1px]">
                                <BsThreeDotsVertical 
                                  size={15}
                                />
                              </div>
                            </label>
                            <ul 
                              tabIndex={0} 
                              className="dropdown-content menu shadow rounded-box w-[158px] bg-[#ffffff] dark:bg-[#181818] !text-gray-900 border border-gray-900"
                            >
                              <li className="text-xs uppercase tracking-widest">
                                <a 
                                  className="hover:!bg-[#e6e6e6] dark:hover:!bg-[#222222]"
                                  onClick={() => donwloadImage(draw.image, draw._id)}
                                >
                                  <div className="flex flex-row space-x-2 !text-gray-900 dark:!text-gray-300">
                                    <span className="my-auto text-[11px] text-inherit">Baixar imagem</span>
                                    <BsFillFileEarmarkArrowDownFill size={22} className="mt-1"/>
                                  </div>
                                </a>
                              </li>
                              <li className="text-xs uppercase tracking-widest">
                                <a 
                                  className="hover:!bg-[#e6e6e6] dark:hover:!bg-[#222222]"
                                  onClick={() => handleDelete(draw._id, index)}
                                >
                                  <div className="flex flex-row space-x-2 !text-gray-900 dark:!text-gray-300">
                                    <span className="my-auto text-[11px] text-inherit">
                                      {loader ? "Excluindo..." : "Excluir"}
                                    </span>
                                    <BsFillTrashFill size={16} />
                                  </div>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                      <img
                        className="max-w-sm xxs:w-[20rem] w-full object-cover max-h-80 h-56 mb-0 pb-0"
                        src={draw.image}
                        alt="Card image"
                      />
                    </div>
                    <div className="px-6 py-5">
                      <div className="font-bold text-xl mb-2 xxs:text-lg">{draw.type}</div>
                      <div className="flex flex-col space-y-1 mt-4">
                        <p className="text-gray-900 font-bold text-base">Cliente</p>
                        <p>{draw.client.name}</p>
                      </div>
                      <div className="flex flex-col space-y-1 mt-4">
                        <p className="text-gray-900 font-bold text-base">Endereço</p>
                        <p>{draw.client.address}</p>
                      </div>
                    </div>
                  </div> 
                )
              })}
            </>
          ) : isFetching && (
            <div className="mt-5 flex flex-col space-y-5 justify-center items-center">
              <p className="animate-pulse">Carregando...</p>
              <span className="loading loading-spinner loading-lg"/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}