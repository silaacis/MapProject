using MapApi.Dtos;
using MapApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MapApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeometriesController : ControllerBase
    {
        private readonly IGeometryService _geometryService;

        public GeometriesController(IGeometryService geometryService)
        {
            _geometryService = geometryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var values = await _geometryService.GetAllAsync();
            return Ok(values);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateGeometryDto createGeometryDto)
        {
            var value = await _geometryService.CreateAsync(createGeometryDto);
            return Ok(value);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _geometryService.DeleteAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateGeometryDto updateGeometryDto)
        {
            var result = await _geometryService.UpdateGeometryAsync(id, updateGeometryDto);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("{id}/contained")]
        public async Task<IActionResult> GetContainedGeometries(int id)
        {
            var values = await _geometryService.GetContainedGeometriesAsync(id);
            return Ok(values);  
        }
    }
}
