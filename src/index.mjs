//execução
//node --experimental-modules src/index.mjs

import jimp from 'jimp';
import path from 'path';
import moment from 'moment';
import wa from '@open-wa/wa-automate';


//define a data no idioma portugês
moment.locale("pt-br");

function pegarLinkDeImagemAleatorio(){
    return `https://picsum.photos/400/400?random=${Math.random()}`
}

async function pegarDimensoesDaImagem(imagem){
    const largura = await imagem.getWidth();
    const altura = await imagem.getHeight();

    return {largura, altura};
} 

async function pegarDimensoesDeTexto({font, texto}){
    //pega o tamanho do texto com a fonte
    const largura = await jimp.measureText(font, texto);
    const altura = await jimp.measureTextHeight(font, texto,largura);

    return {largura, altura};
}

function pegarPosicaoCentralDeDimensao({dimensaoImagem, dimensaoTexto}){
    return dimensaoImagem/2 - dimensaoTexto/2;
}

(async function(){
    const link = pegarLinkDeImagemAleatorio();
    const imagem = await jimp.read(link);
    const dimensoesDaImagem = await pegarDimensoesDaImagem(imagem);
    
    const font78 = await jimp.loadFont(path.resolve('src/fonts/font78.fnt'));
    const dimensoesDaFont78 = await pegarDimensoesDeTexto({font: font78, texto:"BOM DIA"});

    const font28 = await jimp.loadFont(path.resolve('src/fonts/font28.fnt'));
    const dimensoesDaFont28 = await pegarDimensoesDeTexto({font: font28, texto:"QUE VOCÊ TENHA UMA ÓTIMA"});

   
    let imagemComTexto = await imagem.print(
        font78,
        pegarPosicaoCentralDeDimensao(
            {dimensaoImagem: dimensoesDaImagem.largura, 
            dimensaoTexto: dimensoesDaFont78.largura}), 
            0, 
        "BOM DIA");
    
    imagemComTexto = await imagemComTexto.print(
        font28,
        pegarPosicaoCentralDeDimensao({
            dimensaoImagem: dimensoesDaImagem.largura,
            dimensaoTexto: dimensoesDaFont28.largura,
        }),
        dimensoesDaImagem.altura - dimensoesDaFont28.altura,
        "Que você tenha uma ótima"

    );
    
    imagemComTexto = await imagemComTexto.print(
        font28,
        pegarPosicaoCentralDeDimensao({
            dimensaoImagem: dimensoesDaImagem.largura,
            dimensaoTexto: dimensoesDaFont28.largura,
        }),
        dimensoesDaImagem.altura - dimensoesDaFont28.altura + 20,
        moment().format("dddd")

    );


    const imagemBase64 = await imagemComTexto.getBase64Async(jimp.MIME_JPEG);
    // console.log(imagemBase64);

    //conectando com o whatsapp
    const cliente = await wa.create();

    //enviando para os grupos
    const grupos = await cliente.getAllGroups();

    //selecioandno os grupos desejados
    const familiares = grupos.filter(grupo => grupo.formattedTitle.indexOf("Familia")!== -1);
    
  

    console.log(familiares);
    
    
    
     
    for(let index =0; index < familiares.length; index++){
        // console.log(index);
        // console.log(familiares[index].id);
        // console.log(familiares[0].id);

         cliente.sendFile(
            familiares[index].id,
            // familiares[index].id._serialized, 
            imagemBase64, 
            'bomdia.jpeg',
            "ENVIADO DO ROBÔ DO KEVIN"
        );
       
    }



} )()