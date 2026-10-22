import site from '../data/es/site.json' with {type:'json'};
import chineseSite from '../data/zh/site.json' with {type:'json'};
import detail from '../data/zh/product-detail-content.json' with {type:'json'};

const productText={
 'led-channel-letters':{
  summary:'Letras luminosas de frente claro y contorno definido, hechas a medida para tu logotipo y las condiciones de la fachada.',
  detailTitle:'Del frente translúcido a la iluminación interior.',
  details:[['Cara y cuerpo de la letra','Una cara translúcida y laterales metálicos definen cada letra. Los materiales, colores y grosores se ajustan al logotipo.'],['Distribución y montaje de LED','La ubicación de los LED depende del trazo, el grosor y la cara. También se planifican las salidas de cable y el acceso para mantenimiento.']],
  faqs:[['¿Se pueden iluminar de frente letras pequeñas o de trazo fino?','Hay que evaluar el trazo mínimo, las dimensiones, el grosor y la transmisión de luz. Envíanos el logotipo vectorial y una medida aproximada para estudiar una solución viable.'],['¿Cómo se elige el color de luz y se evita una iluminación desigual?','El color se elige según la marca y la luz del lugar. La uniformidad depende también del grosor, la cara y la distribución de LED; para efectos importantes se puede acordar una muestra.']],
  headline:'Haz que tu marca se vea con claridad.'
 },
 'backlit-letters':{
  summary:'Un halo suave realza el acabado metálico. Elegimos la iluminación según tu marca, la pared y la luz del espacio.',
  detailTitle:'Observa la letra de cerca y compara el halo detrás.',
  details:[['Superficie metálica y contorno','La cara opaca muestra un acabado metálico o pintado, mientras la luz posterior realza la forma del logotipo.'],['Separación de la pared y halo','La textura de la pared, la luz ambiental y la distancia de montaje cambian la anchura del halo; hay que confirmarlas para cada ubicación.']],
  faqs:[['¿Qué tipo de pared funciona mejor para letras retroiluminadas?','El color, la textura y la reflectividad afectan el halo. Envíanos una foto frontal e indica el material de la pared y la iluminación cercana.'],['¿Se puede elegir luz cálida o blanca fría?','Sí. Comparamos ambas opciones con el estilo de la marca, el acabado de las letras y la iluminación del interior. El resultado se confirma en las especificaciones del proyecto.']],
  headline:'Un halo de luz para destacar tu marca.'
 },
 'metal-letters':{
  summary:'Expresa tu marca con materiales, acabados y volumen. Compara metal cepillado, tonos metálicos y pintura para elegir la mejor opción.',
  detailTitle:'La textura del material y los detalles de la estructura.',
  details:[['Superficie y color','Los acabados cepillados, metálicos y pintados reflejan la luz de forma distinta. La iluminación del lugar y una muestra de color ayudan a elegir.'],['Grosor, laterales y fijación','El grosor y la construcción lateral definen el volumen, el peso, las fijaciones y la preparación del montaje.']],
  faqs:[['¿En qué se diferencian las letras macizas cortadas y las letras corpóreas con laterales?','Las primeras obtienen volumen del grosor de la placa; las segundas permiten un cuerpo más profundo. Se diferencian en peso, aspecto y fijación, por lo que elegimos según tamaño y ubicación.'],['¿Qué material y acabado convienen para letras metálicas exteriores?','Depende del clima, la salinidad, la humedad, la pared y el mantenimiento. Con la ubicación de instalación podemos estudiar el metal, el recubrimiento y las fijaciones.']],
  headline:'La textura que expresa tu marca.'
 },
 'acrylic-letters':{
  summary:'Da forma a tu logotipo con color, grosor y capas. Ideal para recepciones, expositores y espacios comerciales creativos.',
  detailTitle:'Observa el borde y descubre el material.',
  details:[['Contorno y grosor','El grosor del acrílico, el acabado de los bordes y la separación de la pared crean un relieve nítido.'],['Color opaco, transparencia y capas','Comparamos materiales opacos, transparentes y combinados según los colores de la marca y el entorno.']],
  faqs:[['¿Se puede hacer un logotipo de acrílico con varias capas o transparente?','Sí. Estudiamos acabados opacos, transparentes, esmerilados y superpuestos. Las capas y fijaciones dependen del detalle del diseño, el grosor y el lugar.'],['¿Se puede reproducir exactamente el color que veo en pantalla?','Pantallas, fotos y materiales físicos muestran colores distintos. Para colores importantes, proporciona un valor definido o una muestra y confirma material y acabado antes de fabricar.']],
  headline:'Color para expresar tu marca.'
 },
 'lightbox-neon':{
  summary:'Las cajas de luz muestran el gráfico de marca y el neón LED aporta líneas luminosas. Compara ambas opciones para tu fachada o interior.',
  detailTitle:'Dos efectos de luz y dos estructuras.',
  details:[['Panel y estructura de la caja de luz','El panel translúcido, el marco metálico y las fijaciones se definen según el gráfico, el tamaño y la orientación de montaje.'],['Fuente de luz lineal y panel trasero','Una fuente flexible sigue el diseño sobre un panel; las curvas, el ancho de línea, la forma del panel y la salida del cable se estudian juntos.']],
  faqs:[['¿Conviene una caja de luz o un rótulo de neón LED?','La caja de luz funciona bien para un gráfico completo o una superficie luminosa amplia. El neón LED destaca trazos y ambiente. Una foto del lugar ayuda a comparar.'],['¿Puede instalarse fuera un modelo pensado para interiores?','Hay que volver a evaluar la protección, las fijaciones, el cableado y el mantenimiento. Define la ubicación y los requisitos locales antes de preparar el presupuesto.']],
  headline:'Luz para la marca y el ambiente.'
 },
 'specialty-signs':{
  summary:'Desde letras con bombillas hasta LED expuestos y técnicas combinadas, estudiamos una estructura y una iluminación viables para tu diseño.',
  detailTitle:'Distintas fuentes de luz para distintas personalidades.',
  details:[['Letras con bombillas de estilo marquesina','Las bombillas visibles y el metal tridimensional crean un aspecto clásico. La distribución de luces y el mantenimiento deben planificarse desde el inicio.'],['Letras con LED expuestos','Los puntos de luz siguen la forma de cada letra. El trazo, la distancia de visión y la separación de los puntos afectan la legibilidad.']],
  faqs:[['¿Basta una imagen de referencia para estudiar una tipografía o forma especial?','Sí. Comparte la imagen, el uso y una medida aproximada. Evaluamos materiales, iluminación y estructura; para detalles complejos podemos acordar muestras al preparar el presupuesto.'],['¿Qué acceso de mantenimiento requieren las letras con bombillas o LED expuestos?','Hay que planificar el cambio de luces, la fuente de alimentación, el cableado y el acceso según la altura y ubicación. El método final se confirma con la estructura y el montaje.']],
  headline:'Hecho a medida de una idea singular.'
 }
};

const cases={
 'office-logo-concept':'La cara oscura y el halo blanco neutro destacan el contorno sobre una pared oscura.',
 'wellness-halo-design':'La luz cálida se extiende detrás del símbolo floral y las letras, realzando la piedra clara y los detalles de marca.',
 'corporate-halo-design':'El blanco frío contrasta con el metal cepillado; el color de luz se elige según la iluminación de la oficina.',
 'hospitality-halo-design':'Un halo cálido acompaña el ambiente del restaurante y destaca la superficie metálica durante la noche.',
 'storefront-concept':'El símbolo y las letras iluminados permiten evaluar la visibilidad del logotipo en toda la fachada.',
 'food-front-design':'Las letras verdes contrastan con la entrada del restaurante; importan la forma, el espaciado y la distancia de lectura.',
 'retail-front-design':'Las letras azules iluminadas dan más visibilidad al comercio y pueden adaptarse a los colores de la marca.',
 'bakery-front-design':'Las letras de frente luminoso y la luz cálida del escaparate se equilibran en una fachada nocturna.',
 'hospitality-metal-concept':'El acabado metálico cálido acompaña la entrada del hotel y aporta volumen mediante grosor, luces y sombras.',
 'studio-metal-design':'El rótulo de metal negro contrasta con la pared clara y muestra la relación entre símbolo, texto y entrada.',
 'architectural-metal-design':'Las letras sin luz integrada destacan por su forma y superficie bajo la luz natural.',
 'interior-metal-design':'El metal cepillado sobre una pared interior crea profundidad mediante el grosor y la sombra.',
 'acrylic-reception-concept':'Las letras naranjas opacas se convierten en el centro de la recepción mediante color y relieve.',
 'layered-acrylic-design':'Los gráficos en capas y los materiales de colores añaden profundidad a un espacio creativo.',
 'salon-acrylic-design':'La tipografía manuscrita se integra con materiales interiores suaves; sus trazos finos requieren atención en fabricación y montaje.',
 'office-acrylic-design':'Un rótulo tridimensional discreto se adapta a una recepción; conviene comparar el tamaño del logotipo con la pared.',
 'cafe-neon-concept':'Las líneas luminosas delante del escaparate crean un ambiente cálido en el local.',
 'dental-lightbox-design':'La caja de luz muestra el logotipo completo y permite estudiar el panel translúcido y la visibilidad de la entrada.',
 'projecting-lightbox-design':'La caja de luz circular sobresale hacia la calle; la estructura depende del soporte, la orientación y el lugar.',
 'cafe-neon-design':'Los gráficos y las líneas luminosas dan identidad al interior de la cafetería.',
 'marquee-entrance-concept':'Las bombillas expuestas dibujan letras tridimensionales y crean un foco visual clásico en la entrada.',
 'cinema-special-design':'Las letras de estilo marquesina aportan ritmo luminoso y visibilidad nocturna a un local de ocio.',
 'social-special-design':'La forma tridimensional y la iluminación expresan el carácter del espacio; los trazos complejos requieren evaluación.',
 'restaurant-special-design':'Los materiales combinados pueden integrar metal, acabado y luz con la entrada del restaurante.'
};

const products=Object.fromEntries(Object.entries(detail.products).map(([slug,original])=>{
 const localized=productText[slug];
 return [slug,{...original,...localized,details:original.details.map((part,index)=>({...part,title:localized.details[index][0],text:localized.details[index][1]}))}];
}));
export const spanishPublicCopy={site,detail:{...detail,products,cases}};

// Keep product copy and the exact-key translator in sync without duplicating
// the same Spanish paragraph in two resource files.
const contentDictionary={};
function collect(source,localized){
 if(typeof source==='string'&&typeof localized==='string'){
  if(source!==localized)contentDictionary[source.trim()]=localized.trim();
  return;
 }
 if(Array.isArray(source)&&Array.isArray(localized))source.forEach((value,index)=>collect(value,localized[index]));
 else if(source&&localized&&typeof source==='object'&&typeof localized==='object')Object.keys(source).forEach(key=>collect(source[key],localized[key]));
}
collect(chineseSite,site);
collect(detail,spanishPublicCopy.detail);
export const spanishContentDictionary=contentDictionary;
