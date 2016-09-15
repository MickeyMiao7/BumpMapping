//============================================================
// STUDENT NAME: MIAO QI 
// MATRIC NO.  : A0159327X
// NUS EMAIL   : E0046706@u.nus.edu
// COMMENTS TO GRADER:
// Sincere thanks for sending me the learning materials of computer graphics, which really helped me a lot.
// And thanks for answering all my questions and replying the emails.

// I have no fundamation of graphics so it took me really plenty of time to make everything out and I learned a lot from the process.
// From my point of view, the result of the programme has satisfied the requirements.
// But in case there is any problem, please kindly tell me so that I can know where I am wrong and correct it to make progress.

// Thanks again.

//============================================================
//
// FILE: assign1.frag


//============================================================================
// Eye-space position and vectors for setting up a tangent space at the fragment.
//============================================================================

varying vec3 ecPosition;    // Fragment's 3D position in eye space.
varying vec3 ecNormal;      // Fragment's normal vector in eye space.
varying vec3 ecTangent;     // Frgament's tangent vector in eye space.


//============================================================================
// TileDensity specifies the number of tiles to span across each dimension when the
// texture coordinates gl_TexCoord[0].s and gl_TexCoord[0].t range from 0.0 to 1.0.
//============================================================================

uniform float TileDensity;  // (0.0, inf)


//============================================================================
// TubeRadius is the radius of the semi-circular mirror tubes that run along 
// the boundary of each tile. The radius is relative to the tile size, which 
// is considered to be 1.0 x 1.0.
//============================================================================

uniform float TubeRadius;  // (0.0, 0.5]


//============================================================================
// StickerWidth is the width of the square sticker. The entire square sticker 
// must appear at the center of each tile. The width is relative to the 
// tile size, which is considered to be 1.0 x 1.0.
//============================================================================

uniform float StickerWidth;  // (0.0, 1.0]


//============================================================================
// EnvMap references the environment cubemap for reflection mapping.
//============================================================================

uniform samplerCube EnvMap;


//============================================================================
// DiffuseTex1 references the wood texture map whose color is used to 
// modulate the ambient and diffuse lighting components on the non-mirror and
// non-sticker regions.
//============================================================================

uniform sampler2D DiffuseTex1;


//============================================================================
// DiffuseTex2 references the sticker texture map whose color is used to 
// modulate the ambient and diffuse lighting components on the sticker regions.
//============================================================================

uniform sampler2D DiffuseTex2;




void main()
{
    vec2 c = TileDensity * gl_TexCoord[0].st;
    vec2 p = fract( c ) - vec2( 0.5 );

    // Some useful eye-space vectors.
    vec3 ecNNormal = normalize( ecNormal );
    vec3 ecViewVec = -normalize( ecPosition );

    vec3 ecLightPos = vec3( gl_LightSource[0].position ) / gl_LightSource[0].position.w;
	vec3 ecLightVec = normalize(ecLightPos - ecPosition);
	vec3 ecHalfVec = normalize(ecLightVec + ecViewVec);
	
	vec4 woodTexel = texture2D(DiffuseTex1, gl_TexCoord[0].st);

	//////////////////////////////////////////////////////////
    // REPLACE THE CONDITION IN THE FOLLOWING IF STATEMENT. //
    //////////////////////////////////////////////////////////

	
	// BackFacing
	if (!gl_FrontFacing)
    {
        //======================================================================
        // In here, fragment is backfacing or in the non-bump region.
        //======================================================================

        // For the lighting computation, use the half-vector approach 
        // to compute the specular component.


		/* It is the back face, and ecNormal is pointing out on the frontside of the polygon, 
		in order to do lighting computation for the backside of the polygon,
		we have to use a flipped version of it as the normal vector for the backside.
		*/
		float N_dot_L = max( 0.0, dot(-ecNNormal, ecLightVec ) ); 
		float N_dot_H = max( 0.0, dot(-ecNNormal, ecHalfVec ) );
		float pf = ( N_dot_H == 0.0 )? 0.0 : pow( N_dot_H, gl_FrontMaterial.shininess );

		//Calculate fragment color using Phong Model
		gl_FragColor = gl_FrontLightModelProduct.sceneColor * woodTexel +
					   gl_LightSource[0].ambient * gl_FrontMaterial.ambient * woodTexel +
					   gl_LightSource[0].diffuse * gl_FrontMaterial.diffuse * N_dot_L * woodTexel +
					   gl_LightSource[0].specular * gl_FrontMaterial.specular * pf;

       

    }

	// FrontFacing
    else
    {
        //======================================================================
        // In here, fragment is front-facing and in the mirror-like bump region.
        //======================================================================

        vec3 N = ecNNormal;
        vec3 B = normalize( cross( N, ecTangent ) );
        vec3 T = cross( B, N );

        vec3 tanPerturbedNormal;  // The perturbed normal vector in tangent space of fragment.
        vec3 ecPerturbedNormal;   // The perturbed normal vector in eye space.
        vec3 ecReflectVec;        // The mirror reflection vector in eye space.


		vec2 c = TileDensity * gl_TexCoord[0].st;
		vec2 p = fract(c) - vec2(0.5);  //The range of p.s, p.t is [-0.5, 0.5]

		float N_dot_L = max( 0.0, dot(ecNNormal, ecLightVec ) );
		float N_dot_H = max( 0.0, dot(ecNNormal, ecHalfVec ) );
		float pf = ( N_dot_H == 0.0 )? 0.0 : pow( N_dot_H, gl_FrontMaterial.shininess );
		
		float stickerRange =  StickerWidth / 2.0;  //For pixel within this range, it is mapping of sticker image
		float woodRange = 0.5 - TubeRadius; // For pixel out of stickerRange but within woodRange, it is mapping of wood image. And out of woodRange, it is mirror reflection

		// Region of the sticker
		if(abs(p.s) <= stickerRange && abs(p.t) <= stickerRange){
			vec2 stickerCoord = p / StickerWidth + vec2(0.5); // Make the coordinate map the texture image of sticker
			vec4 stickerTexel = texture2D(DiffuseTex2, stickerCoord);
			gl_FragColor = gl_FrontLightModelProduct.sceneColor * stickerTexel +
					       gl_LightSource[0].ambient * gl_FrontMaterial.ambient * stickerTexel +
					       gl_LightSource[0].diffuse * gl_FrontMaterial.diffuse * N_dot_L * stickerTexel +
					       gl_LightSource[0].specular * gl_FrontMaterial.specular * pf;
		}
		
		// Region of the wood
		else if(abs(p.s) <= woodRange && abs(p.t) <= woodRange){
			gl_FragColor = gl_FrontLightModelProduct.sceneColor * woodTexel +
					       gl_LightSource[0].ambient * gl_FrontMaterial.ambient * woodTexel +
						   gl_LightSource[0].diffuse * gl_FrontMaterial.diffuse * N_dot_L * woodTexel +
						   gl_LightSource[0].specular * gl_FrontMaterial.specular * pf;    
		}

		// Region of the mirror
		else{
			// I divide the whole coordinate into 4 parts: up, down, left, right.
			// For different parts, the ways to calculate their perturbedNormal are slightly diffent
			
			// Right
			if(p.s > p.t && (p.s > (-p.t))){
				float x = abs(p.s) - 0.5 ;
                float z = sqrt(TubeRadius * TubeRadius - x * x);
                tanPerturbedNormal = normalize(vec3(x, 0, z));
			}

			// Up
			if(p.s < p.t && (p.s > (-p.t))){
				float y = abs(p.t) - 0.5 ;
                float z = sqrt(TubeRadius * TubeRadius - y * y);
                tanPerturbedNormal = normalize(vec3(0, y, z));
			}

			// Left
			if(p.s < p.t && (p.s < (-p.t))){
				float x = 0.5 - abs(p.s);
                float z = sqrt(TubeRadius * TubeRadius - x * x);
                tanPerturbedNormal = normalize(vec3(x, 0, z));
			}

			// Down
			if(p.s > p.t && (p.s < (-p.t))){
				float y = 0.5 - abs(p.t);
                float z = sqrt(TubeRadius * TubeRadius - y * y);
                tanPerturbedNormal = normalize(vec3(0, y, z));
			}

			// transform the perturbedNormal in tangent space into view space using the following formula:
			// O = S.x * T + S.y * B + S.z * N
			ecPerturbedNormal = tanPerturbedNormal.x * T + tanPerturbedNormal.y * B + tanPerturbedNormal.z * N;
			ecReflectVec = reflect(-ecViewVec, ecPerturbedNormal);			     
			gl_FragColor = textureCube(EnvMap, ecReflectVec); 
		}
    }
	/* Generally, I used a lot of if-else in the programme, which I think may in some degree make the 
	rendering slow. Optimizing the representation of each condition and
	reducing the number of if-else may accelerate the computing.
	
	However, here I think these if-else can clearly represent my thinking and 
	this can express each condtion more explicitly. So just let it is.
	*/
}
