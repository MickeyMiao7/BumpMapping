//============================================================
// STUDENT NAME: MIAO QI 
// MATRIC NO.  : A0159327X
// NUS EMAIL   : E0046706@u.nus.edu
// COMMENTS TO GRADER:
// Sincere thanks for sending me the learning materials of computer graphics, which really helped me a lot.
// And thanks for answering all my questions and replying the emails.

// I have no fundamation of graphics so it took me really plenty of time to make everything out and I learned a lot from the process.
// From my point of view, the result of the programme has satisfied the requirements.
// But in case there is any problem, please kindly tell me so that I am able to know where I am wrong and correct it to make progress.

// Thanks again.

//============================================================
//
// FILE: assign1.vert


varying vec3 ecPosition; // Vertex's position in eye space.
varying vec3 ecNormal;   // Vertex's normal vector in eye space.
varying vec3 ecTangent;  // Vertex's tangent vector in eye space.

attribute vec3 Tangent;  // Input vertex's tangent vector in model space.


/*
There are few things to do in vertex shader, just need to calculate the values
of several variables in the eye space, calculate gl_Position and assign the Texture Coordinate.

There are to ways to do the calculation. One is transform all the vectors into tangent space. 
Another keep all the vectors need in eye space and turn the perturbed normal in tangent space to eye space.

Here I use the first way following professor's instructions and obviously it is more convenient.
*/

void main( void )
{
	// all the vectors and position calculated here are in eye space, and then they are passed to fragment shader.
	ecNormal = normalize( gl_NormalMatrix * gl_Normal );	
	ecPosition = vec3(gl_ModelViewMatrix * gl_Vertex);
	ecTangent = normalize( gl_NormalMatrix * Tangent);

	gl_TexCoord[0] = gl_MultiTexCoord0;
	gl_Position = ftransform();


}
